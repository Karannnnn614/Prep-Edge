import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists and has completed onboarding
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    // If user doesn't exist, create them first
    if (!user) {
      const { checkUser } = await import("@/lib/checkUser");
      await checkUser();

      return NextResponse.json({ isOnboarded: false });
    }

    return NextResponse.json({
      isOnboarded: !!user.industry,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        isOnboarded: false,
      },
      { status: 500 }
    );
  }
}
