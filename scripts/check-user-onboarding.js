import { db } from "../lib/prisma.js";
import { getUserOnboardingStatus } from "../actions/user.js";

async function checkUserOnboarding() {
  try {
    // Get all users and their industry status
    const users = await db.user.findMany({
      select: {
        id: true,
        clerkUserId: true,
        industry: true,
        experience: true,
        bio: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("=== USER ONBOARDING STATUS ===");
    console.log("Total users:", users.length);
    console.log();

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  Clerk ID: ${user.clerkUserId}`);
      console.log(`  Industry: ${user.industry || "NOT SET"}`);
      console.log(`  Experience: ${user.experience || "NOT SET"}`);
      console.log(`  Bio: ${user.bio || "NOT SET"}`);
      console.log(`  Skills: ${user.skills || "NOT SET"}`);
      console.log(`  Is Onboarded: ${!!user.industry}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Updated: ${user.updatedAt}`);
      console.log();
    });

    // Test the getUserOnboardingStatus function logic
    try {
      const status = await getUserOnboardingStatus();
      console.log("=== getUserOnboardingStatus() RESULT ===");
      console.log("Current user onboarding status:", status);
    } catch (error) {
      console.log("=== getUserOnboardingStatus() ERROR ===");
      console.log("Error:", error.message);
    }

  } catch (error) {
    console.error("Error checking user onboarding:", error);
  } finally {
    await db.$disconnect();
  }
}

checkUserOnboarding();
