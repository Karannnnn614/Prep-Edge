import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { cache } from "react";
import { executeWithRetry, safeDbOperation } from "./db-utils";

// Cache the user lookup for 1 minute - used in dynamic contexts
export const checkUser = cache(async () => {
  try {
    // First check if we have auth context
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // Get the full user object
    const user = await currentUser();

    if (!user) {
      return null;
    }

    // Use safe database operation with retry logic
    const userRecord = await safeDbOperation(async () => {
      // First try to find user by clerkUserId
      let loggedInUser = await db.user.findUnique({
        where: {
          clerkUserId: user.id,
        },
        include: {
          industryInsight: true, // Include the related industry data
        },
      });

      if (loggedInUser) {
        return loggedInUser;
      }

      // Use upsert to handle email uniqueness gracefully
      const name = `${user.firstName} ${user.lastName}`;
      const email = user.emailAddresses[0].emailAddress;

      const createdUser = await db.user.upsert({
        where: {
          email: email,
        },
        update: {
          clerkUserId: user.id,
          name: name,
          imageUrl: user.imageUrl,
        },
        create: {
          clerkUserId: user.id,
          name: name,
          imageUrl: user.imageUrl,
          email: email,
        },
        include: {
          industryInsight: true,
        },
      });

      return createdUser;
    }, null); // Return null if database operation fails

    return userRecord;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null; // Return null instead of propagating the error
  }
});
