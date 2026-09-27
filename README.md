# Zeloo

Fundação do PWA de gestão colaborativa de manutenção e organização.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod + date-fns
- Supabase (PostgreSQL, Auth, RLS, Storage)
- Deploy na Vercel

## Hierarquia do domínio

Usuário → Grupo de usuários → Grupo de manutenção → Serviço → Rotina → Execução

## Como começar

1. Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

2. Preencha os valores do Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Instale e execute:

```bash
npm install
npm run dev
```

4. Aplique as migrations do banco:

```bash
npx supabase db push
```

5. Verifique a qualidade:

```bash
npm run lint
npm run typecheck
```

## Status da fundação

Implementado nesta etapa:

- Scaffold Next.js + Tailwind + shadcn/ui
- Clientes Supabase (browser/server/middleware)
- Migrations versionadas do domínio
- Helpers e políticas de RLS
- RPCs: `create_user_group`, `leave_user_group` (sucessão de Proprietário), `remove_group_member`, recálculo de rotina
- Autenticação (cadastro / entrar / sair)
- Layout autenticado
- Fluxo de criar/listar/ver grupo (criador vira Proprietário)
- Manifesto PWA + ícones

## Próximos passos recomendados

1. Interface de convites (criar/aceitar/cancelar)
2. CRUD de grupos de manutenção
3. Serviços + criação de execução pontual
4. Rotinas + preview da primeira ocorrência
5. Concluir / reagendar / cancelar execuções
6. Visualização do activity log
7. Service worker / cache offline (depois)
