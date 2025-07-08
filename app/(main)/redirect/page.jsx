import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function RedirectPage() {
  // Add a small delay to ensure session is established
  await new Promise((resolve) => setTimeout(resolve, 200));

  const { userId } = await auth();

  if (!userId) {
    // If no user, redirect to sign-in
    redirect("/sign-in");
    return;
  }

  // Import and use the getUserOnboardingStatus function
  const { getUserOnboardingStatus } = await import("@/actions/user");
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  } else {
    redirect("/onboarding");
  }
}
