import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#d8e7de,_transparent_45%),linear-gradient(160deg,_#f3efe6_0%,_#e7efe9_55%,_#dfe8e2_100%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-[#1f4b3a] sm:text-6xl">
          Mantena
        </p>
        <h1 className="mt-4 max-w-xl text-2xl font-medium text-foreground/90 sm:text-3xl">
          Organize a manutenção da casa e dos espaços compartilhados juntos.
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted-foreground">
          Centralize consertos pontuais e rotinas recorrentes com responsabilidade
          clara, histórico e uso pensado para o celular.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className={cn(buttonVariants())}>
            Começar
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
