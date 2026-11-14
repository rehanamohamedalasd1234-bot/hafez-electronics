create table if not exists public.store_settings (
  id boolean primary key default true check (id = true),
  store_name text not null default 'حافظ للإلكترونيات الحديثة',
  store_tagline text not null default 'كل ما تحتاجه من التقنية الحديثة',
  phone text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (true) on conflict (id) do nothing;
alter table public.store_settings enable row level security;

drop policy if exists "public can read store settings" on public.store_settings;
create policy "public can read store settings" on public.store_settings for select to public using (true);
drop policy if exists "authenticated can manage store settings" on public.store_settings;
create policy "authenticated can manage store settings" on public.store_settings for all to authenticated using (true) with check (true);
