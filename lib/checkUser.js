import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { cache } from "react";
import { headers } from "next/headers";

// Function to determine if code is running on server or during static build
const isServer = () => {
  try {
    headers(); // This will throw an error during static generation
    return true;
  } catch (e) {
    return false;
  }
};

// This version doesn't use headers - safe for static rendering
export const getStaticUser = () => {
  return null; // Return null for static rendering
};

// Cache the user lookup for 1 minute - used in dynamic contexts
export const checkUser = cache(async () => {
  // If we're in a static context, return null
  if (!isServer()) {
    return null;
  }

  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    try {
      const loggedInUser = await db.user.findUnique({
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

      const name = `${user.firstName} ${user.lastName}`;

      const newUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0].emailAddress,
        },
        include: {
          industryInsight: true,
        },
      });

      return newUser;
    } catch (dbError) {
      console.error("Database error in checkUser:", dbError);
      throw new Error(`Database operation failed: ${dbError.message}`);
    }
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null; // Return null instead of propagating the error
  }
});
