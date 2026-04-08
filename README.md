# Lista Universal de Chá de Bebê (Next.js + Supabase + PWA)

Aplicação web mobile-first para lista de presentes com alta concorrência, reserva atômica no banco e atualização em tempo real.

## Stack
- Next.js (App Router)
- Tailwind CSS
- Supabase (Postgres + Realtime + RPC)
- Deploy na Vercel

## Funcionalidades
- **Público**: vitrine de presentes `disponivel`, modal para informar nome e reservar.
- **Admin privado**: CRUD de presentes e controle de status.
- **Concorrência**: função RPC `reserve_gift` com lock transacional (`FOR UPDATE`).
- **Realtime**: mudança de status propaga instantaneamente para todos os clientes abertos.
- **PWA**: `next-pwa`, manifest e metadata para instalação.

## Setup local
1. Instale dependências:
   ```bash
   npm install
   ```
2. Crie o `.env.local` com base em `.env.example`.
3. Rode a migration em `supabase/migrations/20260408_baby_shower.sql` no Supabase SQL Editor.
4. Suba o app:
   ```bash
   npm run dev
   ```
5. Acesse:
   - Público: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin/login`

## Deploy na Vercel
- Defina as mesmas variáveis de ambiente.
- Faça deploy de produção para habilitar SW/PWA.
- Verifique o `manifest.webmanifest` e install prompt.
