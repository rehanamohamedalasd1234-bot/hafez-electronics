-- تشغيل مرة واحدة على مشروع Supabase الحالي
alter table public.products add column if not exists video_url text;
