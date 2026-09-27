import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#F7B73333,_transparent_42%),linear-gradient(165deg,_#FFFDF8_0%,_#FFF1D2_55%,_#FFFDF8_100%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <div className="flex items-center gap-4">
          <Image
            src="/brand/icon-cream.png"
            alt="Zeloo"
            width={88}
            height={88}
            priority
            className="rounded-2xl shadow-sm"
          />
          <Image
            src="/brand/wordmark.png"
            alt="Zeloo"
            width={220}
            height={68}
            priority
            className="h-14 w-auto sm:h-16"
          />
        </div>
        <h1 className="mt-6 max-w-xl text-2xl font-medium text-foreground sm:text-3xl">
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
