"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signInAction, type ActionState } from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <div className="animate-fade-up rounded-3xl border border-border bg-white/90 p-6 shadow-[0_18px_50px_rgba(43,22,12,0.08)] backdrop-blur sm:p-8">
      <div className="mb-6 space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">
          Entrar
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Acesse seus grupos e continue de onde parou.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
