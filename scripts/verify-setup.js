#!/usr/bin/env node

/**
 * Complete Setup Verification Script
 * Run this after setting up your Neon database and environment variables
 */

const fs = require("fs");
const path = require("path");

async function verifyCompleteSetup() {
  console.log("🚀 NextLeap AI Setup Verification\n");

  let allPassed = true;

  // Step 1: Check if .env file exists
  console.log("📋 Step 1: Checking .env file...");
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    console.log("❌ .env file not found!");
    console.log("   Create a .env file in your project root directory.");
    allPassed = false;
  } else {
    console.log("✅ .env file found");
  }

  // Step 2: Check required environment variables
  console.log("\n📋 Step 2: Checking environment variables...");
  const requiredVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "GEMINI_API_KEY",
  ];

  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    if (line.includes("=") && !line.startsWith("#")) {
      const [key, value] = line.split("=");
      envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  });

  for (const varName of requiredVars) {
    if (!envVars[varName]) {
      console.log(`❌ ${varName} is missing`);
      allPassed = false;
    } else {
      console.log(`✅ ${varName} is set`);
    }
  }

  // Step 3: Validate DATABASE_URL format
  console.log("\n📋 Step 3: Validating DATABASE_URL format...");
  const dbUrl = envVars.DATABASE_URL;

  if (dbUrl) {
    try {
      const url = new URL(dbUrl);

      if (
        url.protocol === "postgresql:" &&
        url.hostname.includes("neon.tech") &&
        url.username === "neondb_owner" &&
        url.password &&
        url.searchParams.get("sslmode") === "require"
      ) {
        console.log("✅ DATABASE_URL format is correct for Neon");
      } else {
        console.log("❌ DATABASE_URL format has issues");
        if (url.protocol !== "postgresql:")
          console.log("   - Protocol should be postgresql:");
        if (!url.hostname.includes("neon.tech"))
          console.log("   - Hostname should contain neon.tech");
        if (url.username !== "neondb_owner")
          console.log("   - Username should be neondb_owner");
        if (!url.password) console.log("   - Password is missing");
        if (url.searchParams.get("sslmode") !== "require")
          console.log("   - SSL mode should be require");
        allPassed = false;
      }
    } catch (error) {
      console.log("❌ DATABASE_URL is not a valid URL");
      allPassed = false;
    }
  }

  // Step 4: Check Prisma schema
  console.log("\n📋 Step 4: Checking Prisma schema...");
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

  if (!fs.existsSync(schemaPath)) {
    console.log("❌ Prisma schema not found");
    allPassed = false;
  } else {
    console.log("✅ Prisma schema found");
  }

  // Step 5: Check package.json scripts
  console.log("\n📋 Step 5: Checking package.json scripts...");
  const packagePath = path.join(process.cwd(), "package.json");

  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const requiredScripts = [
      "dev",
      "build",
      "start",
      "test:db",
      "validate:neon",
    ];

    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ ${script} script found`);
      } else {
        console.log(`❌ ${script} script missing`);
        allPassed = false;
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("🎉 Setup verification PASSED!");
    console.log("\n📋 Next steps:");
    console.log("1. Run: npm run validate:neon");
    console.log("2. Run: npm run test:db");
    console.log("3. Run: npx prisma db push");
    console.log("4. Run: npm run dev");
    console.log("\nYour NextLeap AI application should be ready to go! 🚀");
  } else {
    console.log("❌ Setup verification FAILED!");
    console.log("\n📋 Please fix the issues above and try again.");
    console.log(
      "💡 Refer to COMPLETE_NEON_SETUP.md for detailed instructions."
    );
  }

  return allPassed;
}

// Run verification
if (require.main === module) {
  verifyCompleteSetup()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
      console.error("Verification failed:", error);
      process.exit(1);
    });
}

module.exports = { verifyCompleteSetup };
