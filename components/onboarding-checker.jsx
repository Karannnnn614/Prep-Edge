"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const OnboardingChecker = ({ children }) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded || !user) {
        return;
      }

      try {
        const response = await fetch("/api/check-onboarding");
        const data = await response.json();

        if (!data.isOnboarded) {
          router.push("/onboarding");
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error checking onboarding:", error);
        // On error, redirect to onboarding to be safe
        router.push("/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [user, isLoaded, router]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return children;
};

export default OnboardingChecker;
