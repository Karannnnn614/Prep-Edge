// Database cleanup script to handle duplicate users
// Run this once to clean up any duplicate records

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanupDuplicateUsers() {
  try {
    console.log("Starting database cleanup...");

    // Find all users grouped by email
    const duplicateEmails = await prisma.user.groupBy({
      by: ["email"],
      having: {
        email: {
          _count: {
            gt: 1,
          },
        },
      },
      _count: {
        email: true,
      },
    });

    console.log(`Found ${duplicateEmails.length} duplicate email groups`);

    for (const emailGroup of duplicateEmails) {
      console.log(`Processing duplicates for email: ${emailGroup.email}`);

      // Get all users with this email
      const usersWithSameEmail = await prisma.user.findMany({
        where: {
          email: emailGroup.email,
        },
        orderBy: {
          createdAt: "asc", // Keep the oldest one
        },
      });

      // Keep the first user, delete the rest
      const userToKeep = usersWithSameEmail[0];
      const usersToDelete = usersWithSameEmail.slice(1);

      console.log(
        `Keeping user ID: ${userToKeep.id}, deleting ${usersToDelete.length} duplicates`
      );

      // Delete duplicate users
      for (const userToDelete of usersToDelete) {
        await prisma.user.delete({
          where: {
            id: userToDelete.id,
          },
        });
        console.log(`Deleted duplicate user ID: ${userToDelete.id}`);
      }
    }

    console.log("Database cleanup completed successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicateUsers();
