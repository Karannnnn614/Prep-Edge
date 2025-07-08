"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AuthRedirect() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);

  useEffect(() => {
    // Only redirect if:
    // 1. Clerk has loaded
    // 2. User is signed in
    // 3. We're on the homepage
    // 4. We haven't already redirected
    if (isLoaded && isSignedIn && pathname === "/" && !redirectedRef.current) {
      redirectedRef.current = true;
      router.push("/redirect");
    }
  }, [isSignedIn, isLoaded, router, pathname]);

  // This component doesn't render anything
  return null;
}
