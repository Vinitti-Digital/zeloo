import { BrandMark, BrandWordmark } from "@/components/brand/logo";
import { RegisterForm } from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#F7B73333,_transparent_40%),linear-gradient(180deg,_#FFFDF8,_#FFF1D2)]" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark size={64} priority />
          <BrandWordmark height={42} priority />
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
