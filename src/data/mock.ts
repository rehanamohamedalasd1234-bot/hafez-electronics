import {
  Headphones,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type Product = {
  id: number;
  name: string;
  category: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  spec: string;
  imageUrl?: string;
  icon: LucideIcon;
  tint: string;
  surface: string;
};

export type Ad = {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  duration_seconds: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type SalesInvoice = {
  id: string;
  date: string;
  total: number;
  cost_total: number;
  customer?: string;
  phone?: string;
  payment_method?: 'cash' | 'card' | 'transfer';
  items_count?: number;
  discount?: number;
  tax?: number;
};

export type PurchaseInvoice = {
  id: string;
  date: string;
  supplier: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
};

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const initialAds: Ad[] = [
  {
    id: 'ad-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511707267537-b85faf0002fc?auto=format&fit=crop&w=1600&q=85',
    title: 'اكتشف أحدث الهواتف الذكية',
    duration_seconds: 5,
    start_date: dateOffset(-2),
    end_date: dateOffset(30),
    is_active: true,
  },
  {
    id: 'ad-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85',
    title: 'عروض خاصة على السماعات والإكسسوارات',
    duration_seconds: 7,
    start_date: dateOffset(-1),
    end_date: dateOffset(20),
    is_active: true,
  },
  {
    id: 'ad-3',
    type: 'video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'فيديو تجريبي',
    duration_seconds: 8,
    start_date: dateOffset(-1),
    end_date: dateOffset(15),
    is_active: false,
  },
];

export const initialProducts: Product[] = [
  {
    id: 1,
    name: 'آيفون 15 برو',
    category: 'هواتف ذكية',
    barcode: '6281000015015',
    price: 4299,
    cost: 3750,
    stock: 8,
    spec: '256 جيجا · تيتانيوم طبيعي',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80',
    icon: Smartphone,
    tint: 'text-slate-700',
    surface: 'bg-slate-100',
  },
  {
    id: 2,
    name: 'سماعات AirPods Pro',
    category: 'سماعات',
    barcode: '6281000015022',
    price: 999,
    cost: 760,
    stock: 3,
    spec: 'الجيل الثاني · عزل ضوضاء',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80',
    icon: Headphones,
    tint: 'text-blue-700',
    surface: 'bg-blue-50',
  },
  {
    id: 3,
    name: 'ساعة Apple Watch',
    category: 'ساعات ذكية',
    barcode: '6281000015039',
    price: 1599,
    cost: 1200,
    stock: 12,
    spec: 'Series 9 · مقاس 45 مم',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    icon: Watch,
    tint: 'text-rose-700',
    surface: 'bg-rose-50',
  },
  {
    id: 4,
    name: 'آيباد Air',
    category: 'أجهزة لوحية',
    barcode: '6281000015046',
    price: 2799,
    cost: 2350,
    stock: 4,
    spec: '11 بوصة · Wi-Fi · 128 جيجا',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
    icon: Tablet,
    tint: 'text-violet-700',
    surface: 'bg-violet-50',
  },
  {
    id: 5,
    name: 'ماك بوك Air M3',
    category: 'حواسيب',
    barcode: '6281000015053',
    price: 5499,
    cost: 4900,
    stock: 6,
    spec: '13 بوصة · ذاكرة 16 جيجا',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    icon: Laptop,
    tint: 'text-cyan-700',
    surface: 'bg-cyan-50',
  },
  {
    id: 6,
    name: 'شاحن MagSafe',
    category: 'إكسسوارات',
    barcode: '6281000015060',
    price: 199,
    cost: 120,
    stock: 22,
    spec: 'شحن لاسلكي سريع · 15 واط',
    icon: Zap,
    tint: 'text-amber-700',
    surface: 'bg-amber-50',
  },
];

export const initialSales: SalesInvoice[] = [
  { id: '#INV-2048', date: dateOffset(0), total: 4299, cost_total: 3750 },
  { id: '#INV-2047', date: dateOffset(0), total: 1198, cost_total: 880 },
  { id: '#INV-2045', date: dateOffset(-1), total: 1599, cost_total: 1200 },
];

export const initialPurchases: PurchaseInvoice[] = [
  {
    id: '#PUR-1001',
    date: dateOffset(0),
    supplier: 'شركة التقنية',
    productName: 'ماك بوك Air M3',
    quantity: 1,
    unitCost: 4900,
    total: 4900,
  },
];

export const recentInvoices = [
  {
    id: '#INV-2048',
    customer: 'محمد العتيبي',
    date: 'اليوم، ١١:٤٢ ص',
    total: 4299,
    status: 'مكتملة',
  },
  {
    id: '#INV-2047',
    customer: 'عميل نقدي',
    date: 'اليوم، ١٠:١٨ ص',
    total: 1198,
    status: 'مكتملة',
  },
  {
    id: '#INV-2046',
    customer: 'شركة التقنية',
    date: 'اليوم، ٠٩:٥٥ ص',
    total: 5499,
    status: 'مكتملة',
  },
  {
    id: '#INV-2045',
    customer: 'سارة الحربي',
    date: 'أمس، ٠٦:٣٢ م',
    total: 1599,
    status: 'مكتملة',
  },
  {
    id: '#INV-2044',
    customer: 'عبدالله سالم',
    date: 'أمس، ٠٤:١٠ م',
    total: 2799,
    status: 'معلقة',
  },
];
