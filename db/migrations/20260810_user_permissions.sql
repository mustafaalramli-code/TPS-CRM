create table if not exists public.user_permissions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'user' check (role in ('admin','manager','user','viewer')),
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_permissions enable row level security;
grant select, insert, update, delete on public.user_permissions to authenticated;
grant all on public.user_permissions to service_role;

create policy user_permissions_select on public.user_permissions for select to authenticated using (user_id=(select auth.uid()) or coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin');
create policy user_permissions_insert on public.user_permissions for insert to authenticated with check (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin');
create policy user_permissions_update on public.user_permissions for update to authenticated using (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin') with check (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin');
create policy user_permissions_delete on public.user_permissions for delete to authenticated using (coalesce((select auth.jwt())->'app_metadata'->>'role','')='admin');

insert into public.user_permissions (user_id,email,display_name,role,permissions)
select id,email,coalesce(raw_user_meta_data->>'full_name',split_part(email,'@',1)),case when raw_app_meta_data->>'role'='admin' then 'admin' else 'user' end,
case when raw_app_meta_data->>'role'='admin' then '{"Overview":{"view":true,"edit":true},"Customers":{"view":true,"edit":true},"Contacts":{"view":true,"edit":true},"Opportunities":{"view":true,"edit":true},"Projects":{"view":true,"edit":true},"Suppliers":{"view":true,"edit":true},"Activities":{"view":true,"edit":true},"Tasks":{"view":true,"edit":true},"Employees":{"view":true,"edit":true},"Directory":{"view":true,"edit":true},"Reports":{"view":true,"edit":true}}'::jsonb else '{"Overview":{"view":true,"edit":false}}'::jsonb end
from auth.users on conflict (user_id) do update set email=excluded.email,display_name=excluded.display_name;

do $$ declare item record; begin
for item in select * from (values ('clients','Customers'),('contacts','Contacts'),('suppliers','Suppliers'),('opportunities','Opportunities'),('projects','Projects'),('opportunity_history','Opportunities')) as x(table_name,module_name) loop
  execute format('drop policy if exists admin_select on public.%I',item.table_name); execute format('drop policy if exists admin_insert on public.%I',item.table_name); execute format('drop policy if exists admin_update on public.%I',item.table_name); execute format('drop policy if exists admin_delete on public.%I',item.table_name);
  execute format('create policy permissions_select on public.%I for select to authenticated using (coalesce((select auth.jwt())->''app_metadata''->>''role'','''')=''admin'' or exists (select 1 from public.user_permissions p where p.user_id=(select auth.uid()) and coalesce((p.permissions->%L->>''view'')::boolean,false)))',item.table_name,item.module_name);
  execute format('create policy permissions_insert on public.%I for insert to authenticated with check (coalesce((select auth.jwt())->''app_metadata''->>''role'','''')=''admin'' or exists (select 1 from public.user_permissions p where p.user_id=(select auth.uid()) and coalesce((p.permissions->%L->>''edit'')::boolean,false)))',item.table_name,item.module_name);
  execute format('create policy permissions_update on public.%I for update to authenticated using (coalesce((select auth.jwt())->''app_metadata''->>''role'','''')=''admin'' or exists (select 1 from public.user_permissions p where p.user_id=(select auth.uid()) and coalesce((p.permissions->%L->>''edit'')::boolean,false))) with check (coalesce((select auth.jwt())->''app_metadata''->>''role'','''')=''admin'' or exists (select 1 from public.user_permissions p where p.user_id=(select auth.uid()) and coalesce((p.permissions->%L->>''edit'')::boolean,false)))',item.table_name,item.module_name,item.module_name);
  execute format('create policy permissions_delete on public.%I for delete to authenticated using (coalesce((select auth.jwt())->''app_metadata''->>''role'','''')=''admin'' or exists (select 1 from public.user_permissions p where p.user_id=(select auth.uid()) and coalesce((p.permissions->%L->>''edit'')::boolean,false)))',item.table_name,item.module_name);
end loop; end $$;
