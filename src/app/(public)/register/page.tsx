import { RegisterForm } from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#F7B73333,_transparent_40%),linear-gradient(180deg,_#FFFDF8,_#FFF1D2)]" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl text-foreground">
            Mantena
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
