import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 surface-atmosphere" />
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/brand/icon-brown.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_30%] opacity-[0.14] sm:object-[70%_center] sm:opacity-20"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#FFFDF8_8%,#FFFDF8AA_42%,#FFFDF8_100%)] sm:bg-[linear-gradient(100deg,#FFFDF8_0%,#FFFDF8F2_38%,#FFFDF866_68%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-14 sm:py-20">
        <div className="max-w-xl">
          <div className="animate-fade-up flex items-center gap-3">
            <Image
              src="/brand/icon-cream.png"
              alt="Zeloo"
              width={76}
              height={76}
              priority
              className="rounded-2xl shadow-[0_10px_30px_rgba(43,22,12,0.12)]"
            />
            <Image
              src="/brand/wordmark.png"
              alt="Zeloo"
              width={210}
              height={64}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </div>

          <h1 className="animate-fade-up-delay mt-8 font-[family-name:var(--font-display)] text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            A manutenção da casa, organizada em equipe.
          </h1>

          <p className="animate-fade-up-delay-2 mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Crie grupos, acompanhe o que precisa ser feito e mantenha o histórico
            de tudo — no celular, com simplicidade.
          </p>

          <div className="animate-fade-up-delay-2 mt-8 flex flex-col gap-3 sm:flex-row">
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

        <div className="pointer-events-none absolute right-[-8%] bottom-[-6%] hidden w-[48%] max-w-xl lg:block">
          <Image
            src="/brand/icon-brown.png"
            alt=""
            width={560}
            height={560}
            priority
            className="animate-soft-float drop-shadow-[0_28px_50px_rgba(43,22,12,0.2)]"
          />
        </div>
      </div>
    </main>
  );
}
