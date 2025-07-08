import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";

// Mark this page as dynamic
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  try {
    // Check if user is already onboarded
    const { isOnboarded } = await getUserOnboardingStatus();

    if (isOnboarded) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("OnboardingPage: Error checking onboarding status:", error);
    // Continue to show onboarding form if there's an error
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Help us personalize your experience
          </p>
        </div>
        <OnboardingForm industries={industries} />
      </div>
    </main>
  );
}
