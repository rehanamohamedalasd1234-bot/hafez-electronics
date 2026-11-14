-- المرحلة الخامسة: عزل الإعلانات والإعدادات وفواتير البيع والشراء
create table if not exists public.ads (
  id text not null,
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null check (type in ('image', 'video')),
  url text not null,
  title text not null default '',
  duration_seconds integer not null default 5,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (business_id, id)
);

create table if not exists public.purchase_invoices (
  id text not null,
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_date date not null,
  supplier text not null default '',
  product_id bigint references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12,2) not null check (unit_cost >= 0),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  primary key (business_id, id)
);

create table if not exists public.sales_invoices (
  id text not null,
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_date date not null,
  total numeric(12,2) not null check (total >= 0),
  cost_total numeric(12,2) not null default 0 check (cost_total >= 0),
  customer text,
  phone text,
  payment_method text,
  items_count integer,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  primary key (business_id, id)
);

-- تحويل صف الإعدادات القديم إلى إعداد النشاط الأول.
alter table public.store_settings drop constraint if exists store_settings_pkey;
alter table public.store_settings add column if not exists settings_id uuid default gen_random_uuid();
update public.store_settings set settings_id = gen_random_uuid() where settings_id is null;
alter table public.store_settings alter column settings_id set not null;
alter table public.store_settings drop column if exists id;
alter table public.store_settings rename column settings_id to id;
alter table public.store_settings add primary key (id);
alter table public.store_settings add column if not exists business_id uuid references public.businesses(id) on delete cascade;
update public.store_settings set business_id = (select id from public.businesses order by created_at, id limit 1) where business_id is null;
alter table public.store_settings alter column business_id set not null;
create unique index if not exists store_settings_business_unique on public.store_settings(business_id);

alter table public.ads enable row level security;
alter table public.purchase_invoices enable row level security;
alter table public.sales_invoices enable row level security;
alter table public.store_settings enable row level security;

create policy "members can read their ads" on public.ads for select to authenticated using (public.is_business_member(business_id));
create policy "members can manage their ads" on public.ads for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "public can read active ads" on public.ads for select to anon using (is_active = true and current_date between start_date and end_date);

create policy "members can read their purchases" on public.purchase_invoices for select to authenticated using (public.is_business_member(business_id));
create policy "members can manage their purchases" on public.purchase_invoices for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members can read their sales" on public.sales_invoices for select to authenticated using (public.is_business_member(business_id));
create policy "members can manage their sales" on public.sales_invoices for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));

-- إعدادات النشاط عامة للمتجر، والتعديل لأعضاء النشاط فقط.
drop policy if exists "public can read store settings" on public.store_settings;
drop policy if exists "authenticated can manage store settings" on public.store_settings;
create policy "public can read store settings" on public.store_settings for select to public using (true);
create policy "members can manage store settings" on public.store_settings for all to authenticated using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
