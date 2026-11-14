-- المرحلة الثالثة: فصل المنتجات والمخزون والطلبات حسب النشاط
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.businesses) THEN
    RAISE EXCEPTION 'create_at_least_one_business_before_migration';
  END IF;
END $$;

alter table public.products add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.online_orders add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.online_order_items add column if not exists business_id uuid references public.businesses(id) on delete cascade;

-- البيانات القديمة تُنسب للنشاط الأول الموجود حتى لا تضيع.
update public.products set business_id = (select id from public.businesses order by created_at, id limit 1) where business_id is null;
update public.online_orders set business_id = (select id from public.businesses order by created_at, id limit 1) where business_id is null;
update public.online_order_items i set business_id = o.business_id from public.online_orders o where o.id = i.order_id and i.business_id is null;

alter table public.products alter column business_id set not null;
alter table public.online_orders alter column business_id set not null;
alter table public.online_order_items alter column business_id set not null;
create index if not exists products_business_id_idx on public.products(business_id);
create index if not exists online_orders_business_id_idx on public.online_orders(business_id);
create index if not exists online_order_items_business_id_idx on public.online_order_items(business_id);

create or replace function public.is_business_member(p_business_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.business_members where business_id = p_business_id and user_id = p_user_id); $$;
create or replace function public.is_business_owner(p_business_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.businesses where id = p_business_id and owner_id = p_user_id); $$;
revoke all on function public.is_business_member(uuid, uuid) from public;
revoke all on function public.is_business_owner(uuid, uuid) from public;
grant execute on function public.is_business_member(uuid, uuid) to authenticated;
grant execute on function public.is_business_owner(uuid, uuid) to authenticated;

-- الباركود يمكن أن يتكرر بين نشاطين، لكن لا يتكرر داخل النشاط نفسه.
alter table public.products drop constraint if exists products_barcode_key;
create unique index if not exists products_business_barcode_unique on public.products(business_id, barcode);

-- إزالة السياسات القديمة العامة واستبدالها بعزل العضوية.
drop policy if exists "members can view their businesses" on public.businesses;
drop policy if exists "owners can update their businesses" on public.businesses;
create policy "members can view their businesses" on public.businesses for select to authenticated using (public.is_business_member(id));
create policy "owners can update their businesses" on public.businesses for update to authenticated using (public.is_business_owner(id)) with check (public.is_business_owner(id));

drop policy if exists "members can view their memberships" on public.business_members;
drop policy if exists "owners can manage memberships" on public.business_members;
create policy "members can view their memberships" on public.business_members for select to authenticated using (user_id = auth.uid() or public.is_business_owner(business_id));
create policy "owners can manage memberships" on public.business_members for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

drop policy if exists "public can read products" on public.products;
drop policy if exists "authenticated can manage products" on public.products;
create policy "members can read their products" on public.products for select to authenticated
using (public.is_business_member(products.business_id));
create policy "members can manage their products" on public.products for all to authenticated
using (public.is_business_member(products.business_id))
with check (public.is_business_member(products.business_id));

 drop policy if exists "authenticated can manage online orders" on public.online_orders;
drop policy if exists "authenticated can update online orders" on public.online_orders;
create policy "members can read their online orders" on public.online_orders for select to authenticated
using (public.is_business_member(online_orders.business_id));
create policy "members can update their online orders" on public.online_orders for update to authenticated
using (public.is_business_member(online_orders.business_id))
with check (public.is_business_member(online_orders.business_id));

drop policy if exists "authenticated can read order items" on public.online_order_items;
create policy "members can read their order items" on public.online_order_items for select to authenticated
using (public.is_business_member(online_order_items.business_id));

-- قراءة عامة آمنة للمتجر: لا تُرجع إلا منتجات النشاط المطلوب بالرابط.
create or replace function public.get_public_products(p_business_slug text default null)
returns table(id bigint, name text, category text, barcode text, price numeric, cost numeric, stock integer, spec text, image_url text, video_url text, business_id uuid)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name, p.category, p.barcode, p.price, p.cost, p.stock, p.spec, p.image_url, p.video_url, p.business_id
  from public.products p
  join public.businesses b on b.id = p.business_id
  where (p_business_slug is not null and b.slug = lower(trim(p_business_slug)))
     or (p_business_slug is null and b.id = (select id from public.businesses order by created_at, id limit 1))
  order by p.id;
$$;
grant execute on function public.get_public_products(text) to anon, authenticated;

-- الطلب العام يحدد النشاط بالـ slug، والدالة تقفل صفوف منتجات النشاط فقط.
drop function if exists public.create_online_order(text, text, text, text, text, public.payment_method, numeric, jsonb);
create or replace function public.create_online_order(
  p_business_slug text,
  p_customer_name text,
  p_customer_phone text,
  p_city text,
  p_address text,
  p_notes text,
  p_payment_method public.payment_method,
  p_shipping numeric,
  p_items jsonb
) returns table(order_id uuid, order_number text, total numeric)
language plpgsql security definer set search_path = public
as $$
declare v_business_id uuid; v_order_id uuid; v_order_number text := '#WEB-' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text; v_subtotal numeric := 0; v_total numeric; v_item jsonb; v_product products%rowtype; v_quantity integer;
begin
  select b.id into v_business_id from public.businesses b where p_business_slug is null or b.slug = lower(trim(p_business_slug)) order by b.created_at limit 1;
  if v_business_id is null then raise exception 'business_not_found'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'cart_empty'; end if;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = (v_item->>'product_id')::bigint and business_id = v_business_id for update;
    if not found or v_quantity < 1 or v_product.stock < v_quantity then raise exception 'product_unavailable'; end if;
    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;
  v_total := v_subtotal + greatest(coalesce(p_shipping, 0), 0);
  insert into public.online_orders(business_id, order_number, customer_name, customer_phone, city, address, notes, payment_method, subtotal, shipping, total)
  values (v_business_id, v_order_number, trim(p_customer_name), trim(p_customer_phone), trim(p_city), trim(p_address), coalesce(p_notes, ''), p_payment_method, v_subtotal, greatest(coalesce(p_shipping, 0), 0), v_total) returning id into v_order_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = (v_item->>'product_id')::bigint and business_id = v_business_id for update;
    insert into public.online_order_items(business_id, order_id, product_id, product_name, unit_price, quantity) values (v_business_id, v_order_id, v_product.id, v_product.name, v_product.price, v_quantity);
    update public.products set stock = stock - v_quantity, updated_at = now() where id = v_product.id and business_id = v_business_id;
  end loop;
  return query select v_order_id, v_order_number, v_total;
end;
$$;
grant execute on function public.create_online_order(text, text, text, text, text, text, public.payment_method, numeric, jsonb) to anon, authenticated;
