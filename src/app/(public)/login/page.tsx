import Link from "next/link";

import { BrandLogoFull } from "@/components/brand/logo";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center surface-atmosphere px-4 py-10">
      <div className="relative w-full max-w-md space-y-7">
        <Link
          href="/"
          className="mx-auto flex w-fit flex-col items-center transition-transform hover:scale-[1.02]"
          aria-label="Zeloo"
        >
          <BrandLogoFull width={180} priority />
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
