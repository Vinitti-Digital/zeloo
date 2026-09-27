import Link from "next/link";

import { BrandMark, BrandWordmark } from "@/components/brand/logo";
import { RegisterForm } from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center surface-atmosphere px-4 py-10">
      <div className="relative w-full max-w-md space-y-7">
        <Link
          href="/"
          className="mx-auto flex w-fit flex-col items-center gap-3 transition-transform hover:scale-[1.02]"
          aria-label="Zeloo"
        >
          <BrandMark size={68} priority />
          <BrandWordmark height={40} priority />
        </Link>
        <RegisterForm />
      </div>
    </main>
  );
}
