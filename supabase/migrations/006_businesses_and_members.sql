-- المرحلة الأولى من تعدد الأنشطة: النشاط + عضوية الحسابات
create type public.business_member_role as enum ('owner', 'admin', 'staff');

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  business_type text not null default 'other',
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_member_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index if not exists business_members_user_id_idx on public.business_members(user_id);
create index if not exists businesses_owner_id_idx on public.businesses(owner_id);

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;

drop policy if exists "members can view their businesses" on public.businesses;
create policy "members can view their businesses" on public.businesses for select to authenticated
using (exists (select 1 from public.business_members m where m.business_id = businesses.id and m.user_id = auth.uid()));

drop policy if exists "owners can update their businesses" on public.businesses;
create policy "owners can update their businesses" on public.businesses for update to authenticated
using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "members can view their memberships" on public.business_members;
create policy "members can view their memberships" on public.business_members for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.businesses b where b.id = business_members.business_id and b.owner_id = auth.uid()));

drop policy if exists "owners can manage memberships" on public.business_members;
create policy "owners can manage memberships" on public.business_members for all to authenticated
using (exists (select 1 from public.businesses b where b.id = business_members.business_id and b.owner_id = auth.uid()))
with check (exists (select 1 from public.businesses b where b.id = business_members.business_id and b.owner_id = auth.uid()));

create or replace function public.create_my_business(p_name text, p_slug text, p_business_type text default 'other')
returns public.businesses
language plpgsql
security definer
set search_path = public
as $$
declare v_business public.businesses;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if trim(p_name) = '' or trim(p_slug) = '' then raise exception 'name_and_slug_required'; end if;
  insert into public.businesses(name, slug, business_type, owner_id)
  values (trim(p_name), lower(trim(p_slug)), coalesce(nullif(trim(p_business_type), ''), 'other'), auth.uid())
  returning * into v_business;
  insert into public.business_members(business_id, user_id, role) values (v_business.id, auth.uid(), 'owner');
  return v_business;
end;
$$;

grant execute on function public.create_my_business(text, text, text) to authenticated;
