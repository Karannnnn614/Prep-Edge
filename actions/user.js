"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import {
  executeWithRetry,
  transactionWithRetry,
  safeDbOperation,
} from "@/lib/db-utils";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // First try to find the user with retry logic
    let user = await executeWithRetry(async () => {
      return await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    });

    // If user doesn't exist, create them first
    if (!user) {
      const { checkUser } = await import("@/lib/checkUser");
      user = await checkUser(); // This will create the user if they don't exist

      if (!user) {
        throw new Error("Failed to create user");
      }
    }

    // Start a transaction with retry logic
    const result = await transactionWithRetry(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 15000, // 15 second timeout
      }
    );

    revalidatePath("/");
    return { success: true, user: result.updatedUser };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    return { success: false, error: "Failed to update profile. Please try again." };
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("getUserOnboardingStatus called for userId:", userId);

  try {
    // Use safe database operation with fallback
    const result = await safeDbOperation(
      async () => {
        console.log("Attempting to find user with clerkUserId:", userId);
        
        // First try to find the user
        let user = await db.user.findUnique({
          where: { clerkUserId: userId },
          select: {
            industry: true,
          },
        });

        console.log("Found user:", user);

        // If user doesn't exist, create them first
        if (!user) {
          console.log("User not found, creating user...");
          // Import checkUser to create the user
          const { checkUser } = await import("@/lib/checkUser");
          await checkUser(); // This will create the user if they don't exist

          // Now try to find the user again
          user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: {
              industry: true,
            },
          });
          console.log("User after creation:", user);
        }

        const isOnboarded = !!user?.industry;
        console.log("Industry value:", user?.industry);
        console.log("isOnboarded result:", isOnboarded);

        return {
          isOnboarded,
        };
      },
      { isOnboarded: false }
    ); // Fallback to not onboarded if database fails

    console.log("Final result:", result);
    return result;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // Return fallback value instead of throwing
    return { isOnboarded: false };
  }
}
