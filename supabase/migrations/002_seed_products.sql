-- تعبئة المنتجات التجريبية الحالية مرة واحدة فقط.
insert into public.products (id, name, category, barcode, price, cost, stock, spec, image_url)
values
(1, 'آيفون 15 برو', 'هواتف ذكية', '6281000015015', 4299, 3750, 8, '256 جيجا · تيتانيوم طبيعي', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80'),
(2, 'سماعات AirPods Pro', 'سماعات', '6281000015022', 999, 760, 3, 'الجيل الثاني · عزل ضوضاء', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80'),
(3, 'ساعة Apple Watch', 'ساعات ذكية', '6281000015039', 1599, 1200, 12, 'Series 9 · مقاس 45 مم', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80'),
(4, 'آيباد Air', 'أجهزة لوحية', '6281000015046', 2799, 2350, 4, '11 بوصة · Wi-Fi · 128 جيجا', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80'),
(5, 'ماك بوك Air M3', 'حواسيب', '6281000015053', 5499, 4900, 6, '13 بوصة · ذاكرة 16 جيجا', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'),
(6, 'شاحن MagSafe', 'إكسسوارات', '6281000015060', 199, 120, 22, 'شحن لاسلكي سريع · 15 واط', null)
on conflict (id) do update set name = excluded.name, category = excluded.category, barcode = excluded.barcode, price = excluded.price, cost = excluded.cost, spec = excluded.spec, image_url = excluded.image_url, updated_at = now();
