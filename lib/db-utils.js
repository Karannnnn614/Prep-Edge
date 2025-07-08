import { db } from "./prisma";

/**
 * Utility function to execute database operations with retry logic
 * @param {Function} operation - Database operation to execute
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Delay between retries in milliseconds
 * @returns {Promise} - Result of the database operation
 */
export async function executeWithRetry(
  operation,
  maxRetries = 3,
  delayMs = 1000
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test database connection before executing operation
      await db.$queryRaw`SELECT 1`;

      // Execute the operation
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error;

      console.error(
        `Database operation failed (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      // Check if it's a connection-related error
      const isConnectionError =
        error.message.includes("connection") ||
        error.message.includes("E57P01") ||
        error.message.includes("timeout") ||
        error.message.includes("ECONNRESET") ||
        error.message.includes("ENOTFOUND");

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Retrying database operation in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }

      // If it's not a connection error or we've exhausted retries, throw the error
      throw error;
    }
  }

  throw lastError;
}

/**
 * Check if database is healthy
 * @returns {Promise<boolean>} - True if database is accessible
 */
export async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error.message);
    return false;
  }
}

/**
 * Gracefully handle database operations with fallback
 * @param {Function} operation - Database operation to execute
 * @param {any} fallbackValue - Value to return if operation fails
 * @returns {Promise} - Result of operation or fallback value
 */
export async function safeDbOperation(operation, fallbackValue = null) {
  try {
    return await executeWithRetry(operation);
  } catch (error) {
    console.error("Database operation failed after retries:", error.message);
    return fallbackValue;
  }
}

/**
 * Execute multiple database operations in a transaction with retry logic
 * @param {Function} transactionOperations - Function containing transaction operations
 * @param {Object} options - Transaction options
 * @returns {Promise} - Result of transaction
 */
export async function transactionWithRetry(
  transactionOperations,
  options = {}
) {
  return executeWithRetry(async () => {
    return await db.$transaction(transactionOperations, {
      timeout: 15000, // 15 second timeout
      ...options,
    });
  });
}
