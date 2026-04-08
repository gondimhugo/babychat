-- Baby Shower Universal Registry
-- Core table + secure reservation RPC (atomic, concurrency-safe)

create extension if not exists "pgcrypto";

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  suggested_link text,
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado')),
  reserved_by text,
  reserved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gifts_status_idx on public.gifts(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_gifts_updated_at on public.gifts;
create trigger trg_gifts_updated_at
before update on public.gifts
for each row
execute function public.set_updated_at();

-- Optional baseline RLS (adjust to your auth model)
alter table public.gifts enable row level security;

-- Public can read only available gifts
create policy if not exists "Public can read available gifts"
on public.gifts
for select
using (status = 'disponivel');

-- Authenticated admins can manage gifts (replace with your own claim logic)
create policy if not exists "Admins full access"
on public.gifts
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Atomic reservation RPC:
-- 1) Locks candidate row (FOR UPDATE)
-- 2) Verifies availability
-- 3) Reserves in same transaction
create or replace function public.reserve_gift(
  p_gift_id uuid,
  p_guest_name text
)
returns table (
  success boolean,
  message text,
  gift_id uuid,
  reserved_by text,
  reserved_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gift public.gifts%rowtype;
begin
  if coalesce(trim(p_guest_name), '') = '' then
    return query
      select false, 'Informe seu nome para reservar o presente.', p_gift_id, null::text, null::timestamptz;
    return;
  end if;

  select *
    into v_gift
  from public.gifts
  where id = p_gift_id
  for update;

  if not found then
    return query
      select false, 'Presente não encontrado.', p_gift_id, null::text, null::timestamptz;
    return;
  end if;

  if v_gift.status <> 'disponivel' then
    return query
      select false, 'Ops! Este presente já foi reservado por outra pessoa.', v_gift.id, v_gift.reserved_by, v_gift.reserved_at;
    return;
  end if;

  update public.gifts
     set status = 'reservado',
         reserved_by = trim(p_guest_name),
         reserved_at = now()
   where id = v_gift.id
  returning * into v_gift;

  return query
    select true, 'Presente reservado com sucesso. Obrigado!', v_gift.id, v_gift.reserved_by, v_gift.reserved_at;
end;
$$;

revoke all on function public.reserve_gift(uuid, text) from public;
grant execute on function public.reserve_gift(uuid, text) to anon, authenticated;
