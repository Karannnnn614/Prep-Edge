import { PrismaClient } from "@prisma/client";

function prismaClientSingleton() {
  // Ensure DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set in environment variables");
    throw new Error("DATABASE_URL is required");
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error("DATABASE_URL format is invalid:", dbUrl.substring(0, 20) + '...');
    throw new Error("DATABASE_URL must start with postgresql:// or postgres://");
  }

  console.log("Creating Prisma client with DATABASE_URL:", dbUrl.substring(0, 20) + '...');

  return new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    // Retry configuration for connection issues
    errorFormat: "pretty",
  });
}

// Global variable to track connection state
let connectionRetries = 0;
const MAX_RETRIES = 3;

if (!globalThis.prisma) {
  globalThis.prisma = prismaClientSingleton();
}

export const db = globalThis.prisma;

// Enhanced error handling with reconnection logic
db.$on("error", async (e) => {
  console.error("Prisma Client error:", e);

  // Check if it's a connection error
  if (e.message.includes("connection") || e.message.includes("E57P01")) {
    console.log(
      `Connection error detected. Retry attempt ${
        connectionRetries + 1
      }/${MAX_RETRIES}`
    );

    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;

      try {
        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * connectionRetries)
        );

        // Disconnect and reconnect
        await db.$disconnect();
        globalThis.prisma = prismaClientSingleton();

        console.log("Database reconnection successful");
        connectionRetries = 0; // Reset counter on successful reconnection
      } catch (reconnectError) {
        console.error("Failed to reconnect to database:", reconnectError);

        if (connectionRetries >= MAX_RETRIES) {
          console.error("Maximum connection retries exceeded");
          // Don't exit process in production - let the application handle graceful degradation
          if (process.env.NODE_ENV !== "production") {
            process.exit(1);
          }
        }
      }
    }
  }
});

// Graceful shutdown
process.on("beforeExit", async () => {
  try {
    await db.$disconnect();
    console.log("Database connection closed gracefully");
  } catch (error) {
    console.error("Error during database disconnection:", error);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  console.error("Uncaught Exception:", error);
  try {
    await db.$disconnect();
  } catch (disconnectError) {
    console.error(
      "Error disconnecting database after uncaught exception:",
      disconnectError
    );
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  try {
    await db.$disconnect();
  } catch (disconnectError) {
    console.error(
      "Error disconnecting database after unhandled rejection:",
      disconnectError
    );
  }
});

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
