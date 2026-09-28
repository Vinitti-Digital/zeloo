# Zeloo

PWA de gestão colaborativa de manutenção e organização.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod + date-fns
- Supabase (PostgreSQL, Auth, RLS, Storage, RPC)
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

## Etapas do projeto

> Atualize esta seção a cada entrega relevante. Use `[x]` para concluído, `[~]` para parcial e `[ ]` para pendente.

### 1. Fundação técnica — concluída

- [x] Scaffold Next.js + Tailwind + shadcn/ui
- [x] Clientes Supabase (browser / server / middleware)
- [x] Migrations versionadas do domínio
- [x] Helpers e políticas de RLS (segurança no banco)
- [x] RPCs: `create_user_group`, `leave_user_group` (sucessão de Proprietário), `remove_group_member`, recálculo de rotina
- [x] Autenticação (cadastro / entrar / sair)
- [x] Layout autenticado
- [x] Criar / listar / ver grupo de usuários (criador = Proprietário)
- [x] Manifesto PWA + ícones + exclusão de assets públicos no middleware

### 2. Marca e UI/UX — concluída

- [x] Interface em pt-BR
- [x] Paleta e atmosfera visual Zeloo
- [x] Rebrand (nome, assets, favicon, ícones PWA)
- [x] Novos logos por proporção (mark, wordmark, stack; sem forçar dimensões erradas)
- [x] Polish da landing, auth, lista e detalhe de grupos

### 3. Convites — concluída

- [x] RPCs: `create_invitation`, `accept_invitation`, `cancel_invitation` (+ expire lazy)
- [x] Criar convite para grupo de usuários (Proprietário)
- [x] Aceitar / recusar / cancelar convite
- [x] Listar convites pendentes (remetente no detalhe; convidado em `/groups`)
- [x] Convidado consegue ver o nome do grupo convidado (RLS `user_groups_select_invitee`)

### 4. Grupos de manutenção — concluída

- [x] RPCs: `create_maintenance_group`, `update_maintenance_group`, `delete_maintenance_group`
- [x] CRUD de grupos de manutenção dentro de um grupo de usuários
- [x] Controle de acesso alinhado às políticas RLS (membros criam/editam; Proprietário exclui)

### 5. Serviços — concluída

- [x] RPCs: `create_service`, `update_service`, `delete_service`, `create_one_off_execution`
- [x] CRUD de serviços em `/groups/[id]/maintenance/[maintenanceGroupId]`
- [x] Criação de execução pontual (avulsa) no detalhe do serviço

### 6. Rotinas — concluída

- [x] RPC: `create_service_routine`, `delete_service_routine` (+ `update_service_routine` existente)
- [x] CRUD de rotinas de serviço (1 rotina por serviço)
- [x] Preview da próxima ocorrência via `compute_next_occurrence`
- [x] Recálculo de execuções futuras (respeita `is_active`)

### 7. Execuções — concluída

- [x] RPCs: `complete_execution`, `cancel_execution`, `reschedule_execution`
- [x] Listar execuções no detalhe do serviço (pendentes + histórico)
- [x] Concluir execução
- [x] Reagendar execução
- [x] Cancelar execução

### 8. Activity log — concluída

- [x] Visualização do histórico de atividades do grupo (`activity_logs` + RLS)
- [x] Filtros básicos por tipo e período (via `searchParams` na página do grupo)

### 9. PWA offline — concluída

- [x] Service worker (`public/sw.js`) com precache de shell/assets e runtime cache
- [x] Cache offline das telas principais (network-first + fallback `/offline.html`)
- [x] Estratégia de sync ao reconectar (banner offline + `router.refresh()` + toast)

## Convenções

- Código e nomes de banco em inglês; UI em pt-BR
- Sem Prisma, Nest, Express, Redux ou backend separado
- Sem Service Role no browser
- Segurança e autorização no Postgres (RLS + RPC), não só na UI
- Entrega incremental: atualizar este README ao fechar cada etapa ou item relevante

## Status atual

**Etapa ativa:** concluída (roadmap 1–9)  
**Última atualização do roadmap:** 2026-09-27

### Evoluções pós-roadmap

- [x] Abas no grupo: **Gestão** (CRUD) e **Calendário** (pendências por vencimento)
- [x] UX pendências primeiro: aba **Pendências** (padrão) + lista 7 dias/atrasadas + calendário; **Organizar** enxuta; histórico recolhido; copy Espaço/Tarefa/Pendência/Repetição
