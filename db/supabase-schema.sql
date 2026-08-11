-- Production schema is managed in Supabase. Keep this file as the deployable reference.
-- All public tables use RLS; authenticated access is read-only until application
-- authentication and organization-scoped write policies are introduced.

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), client_code text unique not null,
  name text not null, name_ar text, client_type text, phone text, email text,
  region text, location text, owner_name text, status text not null default 'Active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(), contact_code text unique not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  full_name text not null, job_title text, department text, mobile_phone text,
  email text, region text, location text, role text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(), supplier_code text unique not null,
  name text not null, account_number text, scope text, phone text, email text,
  region text, status text not null default 'Active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(), opportunity_code text unique not null,
  client_id uuid not null references public.clients(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  project_name text not null, document_type text, opportunity_type text,
  inquiry_status text, owner_name text, currency text not null default 'SAR',
  value numeric(14,2), last_call_date date, next_call_date date,
  scope_of_work text, notes text, status text not null default 'Open',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), project_code text unique not null,
  opportunity_id uuid unique references public.opportunities(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null, status text not null default 'New', currency text not null default 'SAR',
  value numeric(14,2), start_date date, estimated_end_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_history (
  id bigint generated always as identity primary key,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  note text not null, created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(), employee_code text unique not null,
  first_name text not null, last_name text not null,
  company text not null default 'Technology Products and Services (TPS)',
  job_title text, department text, email text, business_phone text, home_phone text,
  mobile_phone text, fax_number text, web_page text, street text, city text,
  state_province text, postal_code text, country_region text,
  status text not null default 'Active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
