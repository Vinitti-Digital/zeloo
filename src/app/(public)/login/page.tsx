import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#d8e7de,_transparent_40%),linear-gradient(180deg,_#f7f4ee,_#eef3ef)]" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl text-[#1f4b3a]">
            Mantena
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
