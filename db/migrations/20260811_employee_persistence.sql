create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text unique not null,
  first_name text not null,
  last_name text not null,
  company text not null default 'Technology Products and Services (TPS)',
  job_title text,
  department text,
  email text,
  business_phone text,
  home_phone text,
  mobile_phone text,
  fax_number text,
  web_page text,
  street text,
  city text,
  state_province text,
  postal_code text,
  country_region text,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employees enable row level security;
grant select, insert, update, delete on public.employees to authenticated;
grant all on public.employees to service_role;

drop policy if exists permissions_select on public.employees;
drop policy if exists permissions_insert on public.employees;
drop policy if exists permissions_update on public.employees;
drop policy if exists permissions_delete on public.employees;

create policy permissions_select on public.employees for select to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin' or exists (
  select 1 from public.user_permissions p where p.user_id=(select auth.uid())
  and coalesce((p.permissions->'Employees'->>'view')::boolean,false)
));
create policy permissions_insert on public.employees for insert to authenticated
with check (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin' or exists (
  select 1 from public.user_permissions p where p.user_id=(select auth.uid())
  and coalesce((p.permissions->'Employees'->>'edit')::boolean,false)
));
create policy permissions_update on public.employees for update to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin' or exists (
  select 1 from public.user_permissions p where p.user_id=(select auth.uid())
  and coalesce((p.permissions->'Employees'->>'edit')::boolean,false)
))
with check (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin' or exists (
  select 1 from public.user_permissions p where p.user_id=(select auth.uid())
  and coalesce((p.permissions->'Employees'->>'edit')::boolean,false)
));
create policy permissions_delete on public.employees for delete to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin' or exists (
  select 1 from public.user_permissions p where p.user_id=(select auth.uid())
  and coalesce((p.permissions->'Employees'->>'edit')::boolean,false)
));
