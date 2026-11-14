-- إنشاء مساحة عامة لصور وفيديوهات الأصناف.
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = true;

-- المالك المسجل فقط يستطيع الرفع أو التعديل أو الحذف.
drop policy if exists "owner can upload product media" on storage.objects;
create policy "owner can upload product media" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-media');

drop policy if exists "owner can update product media" on storage.objects;
create policy "owner can update product media" on storage.objects
for update to authenticated
using (bucket_id = 'product-media') with check (bucket_id = 'product-media');

drop policy if exists "owner can delete product media" on storage.objects;
create policy "owner can delete product media" on storage.objects
for delete to authenticated
using (bucket_id = 'product-media');

-- العرض العام للزائر يتم عبر الرابط العام للـ bucket.
drop policy if exists "public can view product media" on storage.objects;
create policy "public can view product media" on storage.objects
for select to public
using (bucket_id = 'product-media');
