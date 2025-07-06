import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn forceRedirectUrl="/redirect" signUpForceRedirectUrl="/redirect" />
  );
}
