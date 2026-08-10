-- Production CRM access: authenticated administrators only.
-- This migration does not seed, reset, or delete application data.
alter table public.clients enable row level security;
alter table public.contacts enable row level security;
alter table public.suppliers enable row level security;
alter table public.opportunities enable row level security;
alter table public.projects enable row level security;
alter table public.opportunity_history enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['clients','contacts','suppliers','opportunities','projects','opportunity_history'] loop
    execute format('drop policy if exists admin_select on public.%I', table_name);
    execute format('drop policy if exists admin_insert on public.%I', table_name);
    execute format('drop policy if exists admin_update on public.%I', table_name);
    execute format('drop policy if exists admin_delete on public.%I', table_name);
    execute format('create policy admin_select on public.%I for select to authenticated using (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
    execute format('create policy admin_insert on public.%I for insert to authenticated with check (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
    execute format('create policy admin_update on public.%I for update to authenticated using (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'') with check (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
    execute format('create policy admin_delete on public.%I for delete to authenticated using (((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'')', table_name);
  end loop;
end $$;

alter table public.projects add column if not exists project_type text;
alter table public.projects add column if not exists owner_name text;
alter table public.projects add column if not exists progress integer not null default 0 check (progress between 0 and 100);
alter table public.projects add column if not exists notes text;
alter table public.opportunities add column if not exists close_date date;

create index if not exists contacts_client_id_idx on public.contacts(client_id);
create index if not exists opportunities_client_id_idx on public.opportunities(client_id);
create index if not exists projects_client_id_idx on public.projects(client_id);
