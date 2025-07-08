import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp afterSignUpUrl="/redirect" redirectUrl="/redirect" />;
}
