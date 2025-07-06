import { redirect } from "next/navigation";
import { getUserOnboardingStatus } from "@/actions/user";

export default async function RedirectPage() {
  try {
    const { isOnboarded } = await getUserOnboardingStatus();

    if (isOnboarded) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("Error in redirect page:", error);
    redirect("/onboarding");
  }
}
