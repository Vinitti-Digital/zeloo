import Link from "next/link";

import { BrandLogoFull, BrandMascot } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 surface-atmosphere" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,#FFF1D2AA_0%,transparent_55%),radial-gradient(ellipse_at_10%_80%,#E7D3BB66_0%,transparent_45%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-6">
          <div className="max-w-xl">
            <div className="animate-fade-up flex justify-center lg:justify-start">
              <BrandLogoFull width={210} priority />
            </div>

            <h1 className="animate-fade-up-delay mt-8 text-center font-[family-name:var(--font-display)] text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-left">
              A manutenção da casa, organizada em equipe.
            </h1>

            <p className="animate-fade-up-delay-2 mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 lg:text-left">
              Crie grupos, acompanhe o que precisa ser feito e mantenha o
              histórico de tudo — no celular, com simplicidade.
            </p>

            <div className="animate-fade-up-delay-2 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                Criar minha conta
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full border-primary/20 bg-white/80 sm:w-auto",
                )}
              >
                Já tenho conta
              </Link>
            </div>
          </div>

          <div className="pointer-events-none relative hidden justify-center lg:flex">
            <BrandMascot
              width={360}
              priority
              className="animate-soft-float drop-shadow-[0_28px_50px_rgba(43,22,12,0.18)]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
