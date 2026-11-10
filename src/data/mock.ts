import { Headphones, Laptop, Smartphone, Tablet, Watch, type LucideIcon } from 'lucide-react';

export type Product = {
  id: number;
  name: string;
  category: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  spec: string;
  icon: LucideIcon;
  tint: string;
  surface: string;
};

export const initialProducts: Product[] = [
  { id: 1, name: 'آيفون 15 برو', category: 'هواتف ذكية', barcode: '6281000015015', price: 4299, cost: 3750, stock: 8, spec: '256 جيجا · تيتانيوم طبيعي', icon: Smartphone, tint: 'text-slate-700', surface: 'bg-slate-100' },
  { id: 2, name: 'سماعات AirPods Pro', category: 'سماعات', barcode: '6281000015022', price: 999, cost: 760, stock: 3, spec: 'الجيل الثاني · عزل ضوضاء', icon: Headphones, tint: 'text-blue-700', surface: 'bg-blue-50' },
  { id: 3, name: 'ساعة Apple Watch', category: 'ساعات ذكية', barcode: '6281000015039', price: 1599, cost: 1200, stock: 12, spec: 'Series 9 · مقاس 45 مم', icon: Watch, tint: 'text-rose-700', surface: 'bg-rose-50' },
  { id: 4, name: 'آيباد Air', category: 'أجهزة لوحية', barcode: '6281000015046', price: 2799, cost: 2350, stock: 4, spec: '11 بوصة · Wi-Fi · 128 جيجا', icon: Tablet, tint: 'text-violet-700', surface: 'bg-violet-50' },
  { id: 5, name: 'ماك بوك Air M3', category: 'حواسيب', barcode: '6281000015053', price: 5499, cost: 4900, stock: 6, spec: '13 بوصة · ذاكرة 16 جيجا', icon: Laptop, tint: 'text-cyan-700', surface: 'bg-cyan-50' },
  { id: 6, name: 'شاحن MagSafe', category: 'إكسسوارات', barcode: '6281000015060', price: 199, cost: 120, stock: 22, spec: 'شحن لاسلكي سريع · 15 واط', icon: Zap, tint: 'text-amber-700', surface: 'bg-amber-50' },
];

export const recentInvoices = [
  { id: '#INV-2048', customer: 'محمد العتيبي', date: 'اليوم، ١١:٤٢ ص', total: 4299, type: 'بيع', status: 'مكتملة' },
  { id: '#INV-2047', customer: 'عميل نقدي', date: 'اليوم، ١٠:١٨ ص', total: 1198, type: 'بيع', status: 'مكتملة' },
  { id: '#INV-2046', customer: 'شركة التقنية', date: 'اليوم، ٠٩:٥٥ ص', total: 5499, type: 'شراء', status: 'مكتملة' },
  { id: '#INV-2045', customer: 'سارة الحربي', date: 'أمس، ٠٦:٣٢ م', total: 1599, type: 'بيع', status: 'مكتملة' },
  { id: '#INV-2044', customer: 'عبدالله سالم', date: 'أمس، ٠٤:١٠ م', total: 2799, type: 'بيع', status: 'معلقة' },
];
