import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Tag,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  Navigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import AdsManager from './pages/AdsManager';
import PosPage from './pages/PosPage';
import { CartPage, CheckoutPage, OrderSuccessPage, Storefront, type StoreSettings } from './pages/VisitorStore';
import {
  initialAds,
  initialProducts,
  initialPurchases,
  initialSales,
  type Ad,
  type Product,
  type PurchaseInvoice,
  type SalesInvoice,
} from './data/mock';
import type { OnlineOrder } from './pages/VisitorStore';
import { supabase } from './lib/supabase';

type AppData = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  ads: Ad[];
  setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  sales: SalesInvoice[];
  setSales: React.Dispatch<React.SetStateAction<SalesInvoice[]>>;
  purchases: PurchaseInvoice[];
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
};

const currency = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 });
const money = (value: number) => `${currency.format(value)} ر.س`;
const today = () => new Date().toISOString().slice(0, 10);

function usePersistentState<T>(key: string, initialValue: T, hydrate?: (saved: T) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (hydrate ? hydrate(JSON.parse(saved) as T) : JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function useAppData() {
  return useOutletContext<AppData>();
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppStateLayout />}>
          <Route index element={<VisitorRoute page="store" />} />
          <Route path="store/:businessSlug" element={<VisitorRoute page="store" />} />
          <Route path="cart" element={<VisitorRoute page="cart" />} />
          <Route path="checkout" element={<VisitorRoute page="checkout" />} />
          <Route path="order-success" element={<VisitorRoute page="success" />} />
          <Route path="owner-login" element={<Navigate to="/admin" replace />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="orders" element={<OnlineOrdersPage />} />
            <Route path="pos" element={<PosRoute />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="purchases" element={<PurchaseInvoicesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="ads" element={<AdsPage />} />
              <Route path="settings" element={<StoreSettingsPage />} />
              <Route path="business" element={<BusinessPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function AppStateLayout() {
  const [products, setProducts] = usePersistentState('hafez-products', initialProducts, (saved) => saved.map((product) => ({
    ...initialProducts.find((item) => item.id === product.id),
    ...product,
  })));
  const [ads, setAds] = usePersistentState('hafez-ads', initialAds);
  const [sales, setSales] = usePersistentState('hafez-sales', initialSales);
  const [purchases, setPurchases] = usePersistentState('hafez-purchases', initialPurchases);
  const [settings, setSettings] = usePersistentState<StoreSettings>('hafez-store-settings', { storeName: 'حافظ للإلكترونيات الحديثة', storeTagline: 'كل ما تحتاجه من التقنية الحديثة', phone: '' });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.from('store_settings').select('store_name,store_tagline,phone').eq('id', true).maybeSingle().then(({ data }) => {
      if (active && data) setSettings({ storeName: data.store_name, storeTagline: data.store_tagline, phone: data.phone ?? '' });
    });
    return () => { active = false; };
  }, [setSettings]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const isAdmin = window.location.pathname.startsWith('/admin');
    const businessSlug = window.location.pathname.startsWith('/store/') ? window.location.pathname.split('/')[2] : null;
    const request = isAdmin
      ? supabase.from('products').select('id,name,category,barcode,price,cost,stock,spec,image_url,video_url,business_id').order('id')
      : supabase.rpc('get_public_products', { p_business_slug: businessSlug });
    void request.then(({ data, error }) => {
      if (!active || error || !data?.length) return;
      setProducts((data as { id: number; name: string; category: string; barcode: string; price: number; cost: number; stock: number; spec: string; image_url?: string | null; video_url?: string | null }[]).map((row) => {
        const fallback = initialProducts.find((item) => item.id === row.id);
        return {
          ...fallback,
          id: row.id,
          name: row.name,
          category: row.category,
          barcode: row.barcode,
          price: Number(row.price),
          cost: Number(row.cost),
          stock: row.stock,
          spec: row.spec,
          imageUrl: row.image_url ?? undefined,
          videoUrl: row.video_url ?? undefined,
        } as Product;
      }));
    });
    return () => { active = false; };
  }, [setProducts]);

  const context: AppData = {
    products,
    setProducts,
    ads,
    setAds,
    sales,
    setSales,
    purchases,
    setPurchases,
    settings,
    setSettings,
  };

  return <Outlet context={context} />;
}

function PosRoute() {
  const { products, setProducts, setSales } = useAppData();
  return <PosPage products={products} setProducts={setProducts} setSales={setSales} />;
}

function OnlineOrdersPage() {
  const [orders, setOrders] = useState<OnlineOrder[]>(() => {
    try { return JSON.parse(localStorage.getItem('hafez-online-orders') ?? '[]') as OnlineOrder[]; } catch { return []; }
  });
  const statusLabels: Record<OnlineOrder['status'], string> = {
    new: 'جديد', confirmed: 'تم التأكيد', preparing: 'قيد التجهيز', shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغي',
  };
  const updateStatus = (id: string, status: OnlineOrder['status']) => {
    const next = orders.map((order) => order.id === id ? { ...order, status } : order);
    setOrders(next);
    localStorage.setItem('hafez-online-orders', JSON.stringify(next));
  };
  return <section className="space-y-5" dir="rtl">
    <div><p className="text-sm text-slate-500">طلبات المتجر الإلكتروني</p><h2 className="mt-1 text-2xl font-bold">طلبات الزوار</h2></div>
    {!orders.length ? <div className="panel p-12 text-center text-slate-500">لا توجد طلبات أونلاين حتى الآن.</div> : <div className="space-y-4">{orders.map((order) => <article key={order.id} className="panel p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold">{order.id} · {order.customer.name}</p><p className="mt-1 text-sm text-slate-500">{order.customer.phone} · {order.customer.city} · {order.customer.address}</p></div><div className="text-left"><p className="font-bold text-orange-600">{money(order.total)}</p><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('ar-SA')}</p></div></div><div className="mt-4 border-t pt-4 text-sm text-slate-600">{order.items.map((item) => <span key={item.productId} className="ml-3 inline-block">{item.name} × {item.quantity}</span>)}</div><div className="mt-4 flex flex-wrap items-center gap-3"><span className="text-sm font-semibold">حالة الطلب</span><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as OnlineOrder['status'])} className="h-10 rounded-lg border bg-white px-3 text-sm">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">الدفع: {order.paymentMethod === 'cash_on_delivery' ? 'عند الاستلام' : 'بطاقة عند الاستلام'}</span></div></article>)}</div>}
  </section>;
}

function AdminLayout() {
 const [menuOpen, setMenuOpen] = useState(false);
  const appData = useAppData();
  const links = [
    { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'طلبات المتجر', icon: ClipboardList },
    { to: '/admin/pos', label: 'نقطة البيع', icon: ShoppingCart },
    { to: '/admin/inventory', label: 'المخزون والمنتجات', icon: Boxes },
    { to: '/admin/purchases', label: 'فواتير الشراء', icon: ClipboardList },
    { to: '/admin/reports', label: 'التقارير', icon: TrendingUp },
    { to: '/admin/ads', label: 'إدارة الإعلانات', icon: Tag },
    { to: '/admin/settings', label: 'إعدادات المتجر', icon: Zap },
    { to: '/admin/business', label: 'النشاط والحسابات', icon: Boxes },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`sidebar fixed inset-y-0 right-0 z-30 flex w-[260px] flex-col bg-[#101828] text-white transition-transform ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
            <Zap size={23} fill="white" />
          </div>
          <div>
            <p className="font-bold">حافظ للإلكترونيات</p>
            <p className="mt-1 text-xs text-slate-400">لوحة المالك · تجريبية</p>
          </div>
          <button className="mr-auto lg:hidden" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 px-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/"
          className="mt-auto border-t border-white/10 p-5 text-sm text-orange-300 hover:text-orange-200"
        >
          <ShoppingBag className="ml-2 inline" size={16} />
          الانتقال إلى المتجر
        </Link>
      </aside>

      {menuOpen && (
        <button
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="إغلاق القائمة"
        />
      )}

      <main className="min-h-screen lg:mr-[260px]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="فتح القائمة">
              <Menu size={21} />
            </button>
            <h1 className="font-bold">لوحة تحكم المالك</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">دخول مفتوح</span>
          </div>
        </header>
        <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-7">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">تنبيه: لوحة الإدارة مفتوحة بدون تسجيل دخول؛ أي شخص يصل إلى هذا الرابط يستطيع استخدامها.</p>
          <Outlet context={appData} />
        </div>
      </main>
    </div>
  );
}

function AdminOverview() {
  const { products, sales, purchases } = useAppData();
  const salesTotal = sales.reduce((sum, item) => sum + item.total, 0);
  const purchaseTotal = purchases.reduce((sum, item) => sum + item.total, 0);
  const profit = sales.reduce((sum, item) => sum + item.total - item.cost_total, 0);
  const lowStock = products.filter((product) => product.stock < 5);

  return (
    <>
      <section className="rounded-3xl bg-[#162237] p-7 text-white sm:p-9">
        <p className="text-sm text-slate-300">مرحباً بك في لوحة التحكم</p>
        <h2 className="mt-2 text-2xl font-bold">إدارة متجرك من مكان واحد.</h2>
        <p className="mt-2 text-sm text-slate-300">المبيعات والمخزون والفواتير والإعلانات — بيانات معاينة.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Metric title="إجمالي المبيعات" value={money(salesTotal)} icon={ShoppingBag} />
        <Metric title="إجمالي المشتريات" value={money(purchaseTotal)} icon={ClipboardList} />
        <Metric title="صافي ربح المبيعات" value={money(profit)} icon={Wallet} />
      </div>

      <section className="panel p-5">
        <h2 className="font-bold">تنبيهات المخزون</h2>
        <div className="mt-4 space-y-2">
          {lowStock.length ? lowStock.map((product) => (
            <p key={product.id} className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm">
              <AlertTriangle size={16} className="text-amber-600" />
              {product.name} — المتبقي {product.stock}
            </p>
          )) : <p className="text-sm text-slate-500">لا توجد أصناف منخفضة المخزون.</p>}
        </div>
      </section>
    </>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: typeof Wallet }) {
  return <div className="panel p-5"><div className="flex items-center justify-between text-slate-500"><span className="text-sm">{title}</span><Icon size={20} className="text-orange-500" /></div><p className="mt-4 text-xl font-bold">{value}</p></div>;
}

function VisitorRoute({ page }: { page: 'store' | 'cart' | 'checkout' | 'success' }) {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const { products, setProducts, ads, settings } = useAppData();
  if (page === 'cart') return <CartPage products={products} setProducts={setProducts} settings={settings} />;
  if (page === 'checkout') return <CheckoutPage products={products} setProducts={setProducts} settings={settings} businessSlug={businessSlug} />;
  if (page === 'success') return <OrderSuccessPage settings={settings} />;
  return <Storefront products={products} setProducts={setProducts} ads={ads} settings={settings} businessSlug={businessSlug} />;
}

function StoreSettingsPage() {
  const { settings, setSettings } = useAppData();
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(settings), [settings]);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    if (supabase) {
      const { error } = await supabase.from('store_settings').upsert({ id: true, store_name: draft.storeName.trim(), store_tagline: draft.storeTagline.trim(), phone: draft.phone.trim(), updated_at: new Date().toISOString() });
      if (error) { window.alert(`تعذر حفظ الإعدادات: ${error.message}`); setSaving(false); return; }
    }
    setSettings(draft);
    setSaving(false);
    window.alert('تم حفظ إعدادات المتجر.');
  };
  return <section className="space-y-5" dir="rtl"><div><h2 className="text-2xl font-bold">إعدادات المتجر</h2><p className="mt-1 text-sm text-slate-500">غيّر اسم النشاط والوصف وبيانات التواصل، وستظهر للزوار تلقائياً.</p></div><form onSubmit={save} className="panel grid max-w-2xl gap-4 p-6"><label className="text-sm font-semibold">اسم المتجر أو النشاط<input required value={draft.storeName} onChange={(event) => setDraft({ ...draft, storeName: event.target.value })} className="mt-2 h-12 w-full rounded-lg border px-3 font-normal" placeholder="مثال: متجر النور للأجهزة" /></label><label className="text-sm font-semibold">الوصف الرئيسي<input required value={draft.storeTagline} onChange={(event) => setDraft({ ...draft, storeTagline: event.target.value })} className="mt-2 h-12 w-full rounded-lg border px-3 font-normal" placeholder="أجهزة أصلية وعروض مميزة" /></label><label className="text-sm font-semibold">رقم التواصل<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className="mt-2 h-12 w-full rounded-lg border px-3 font-normal" placeholder="اختياري" /></label><button disabled={saving} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? 'جارٍ الحفظ...' : 'حفظ إعدادات المتجر'}</button></form></section>;
}

function BusinessPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('electronics');
  const [businesses, setBusinesses] = useState<{ id: string; name: string; slug: string; business_type: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase.from('business_members').select('role,businesses(id,name,slug,business_type)').order('created_at');
    const rows = (data ?? []) as unknown as { role: string; businesses: { id: string; name: string; slug: string; business_type: string } }[];
    setBusinesses(rows.filter((row) => row.businesses).map((row) => ({ ...row.businesses, role: row.role })));
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase.rpc('create_my_business', { p_name: name, p_slug: slug, p_business_type: type });
    if (error) window.alert(`تعذر إنشاء النشاط: ${error.message}`);
    else { setName(''); setSlug(''); window.alert('تم إنشاء النشاط وربط حسابك به.'); await load(); }
    setSaving(false);
  };
  return <section className="space-y-5" dir="rtl"><div><h2 className="text-2xl font-bold">النشاط والحسابات</h2><p className="mt-1 text-sm text-slate-500">كل نشاط مستقل بمنتجاته ومخزونه وطلباته وتقاريره.</p></div><form onSubmit={create} className="panel grid max-w-2xl gap-4 p-6 sm:grid-cols-2"><h3 className="font-bold sm:col-span-2">إنشاء نشاط جديد وربط الحساب الحالي به</h3><label className="text-sm font-semibold sm:col-span-2">اسم النشاط<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal" placeholder="مثال: متجر المنظفات" /></label><label className="text-sm font-semibold">الرابط المختصر<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal" placeholder="cleaning-shop" /><span className="mt-1 block text-xs font-normal text-slate-500">حروف إنجليزية صغيرة وأرقام وشرطة فقط</span></label><label className="text-sm font-semibold">نوع النشاط<select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 h-11 w-full rounded-lg border bg-white px-3 font-normal"><option value="electronics">إلكترونيات</option><option value="cleaning">منظفات</option><option value="clothing">ملابس</option><option value="restaurant">مطعم</option><option value="other">نشاط آخر</option></select></label><button disabled={saving} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50 sm:col-span-2">{saving ? 'جارٍ الإنشاء...' : 'إنشاء وربط النشاط'}</button></form><section className="panel p-6"><h3 className="font-bold">الأنشطة المرتبطة بحسابك</h3>{loading ? <p className="mt-4 text-sm text-slate-500">جارٍ التحميل...</p> : businesses.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{businesses.map((business) => <div key={business.id} className="rounded-xl border p-4"><p className="font-bold">{business.name}</p><p className="mt-1 text-sm text-slate-500">/{business.slug} · {business.business_type} · صلاحية {business.role}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">لم يتم ربط أي نشاط بهذا الحساب بعد.</p>}</section></section>;
}

function InventoryPage() {
  const { products, setProducts } = useAppData();
  const blank = (): Product => ({ id: Date.now(), name: '', category: '', barcode: '', price: 0, cost: 0, stock: 0, spec: '', imageUrl: '', videoUrl: '', icon: Zap, tint: 'text-orange-500', surface: 'bg-orange-50' });
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  useEffect(() => { void supabase?.from('business_members').select('business_id').order('created_at').limit(1).maybeSingle().then(({ data }) => setBusinessId(data?.business_id ?? null)); }, []);
  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || !editing.name.trim() || !editing.barcode.trim() || !businessId) { if (!businessId) window.alert('أنشئ نشاطاً واربط الحساب به أولاً.'); return; }
    setSaving(true);
    const payload = { id: editing.id, business_id: businessId, name: editing.name.trim(), category: editing.category.trim(), barcode: editing.barcode.trim(), price: editing.price, cost: editing.cost, stock: editing.stock, spec: editing.spec.trim(), image_url: editing.imageUrl?.trim() || null, video_url: editing.videoUrl?.trim() || null };
    if (supabase) {
      const { error } = await supabase.from('products').upsert(payload);
      if (error) { window.alert(`تعذر حفظ الصنف: ${error.message}`); setSaving(false); return; }
    }
    setProducts((current) => current.some((product) => product.id === editing.id) ? current.map((product) => product.id === editing.id ? editing : product) : [editing, ...current]);
    setEditing(null);
    setSaving(false);
  };
  const deleteProduct = async (id: number) => {
    if (!window.confirm('هل تريد حذف هذا الصنف؟')) return;
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) { window.alert(`تعذر حذف الصنف: ${error.message}`); return; }
    }
    setProducts((current) => current.filter((product) => product.id !== id));
  };
  const uploadMedia = async (file: File, type: 'image' | 'video') => {
    if (!supabase || !editing) return;
    setSaving(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${type}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from('product-media').upload(path, file, { upsert: false, contentType: file.type });
    if (error) { window.alert(`تعذر رفع الملف: ${error.message}`); setSaving(false); return; }
    const { data } = supabase.storage.from('product-media').getPublicUrl(path);
    setEditing((current) => current ? { ...current, [type === 'image' ? 'imageUrl' : 'videoUrl']: data.publicUrl } : current);
    setSaving(false);
  };
  const field = (label: string, key: keyof Product, type = 'text', wide = false) => <label className={`text-sm ${wide ? 'sm:col-span-2' : ''}`}>{label}<input required={key === 'name' || key === 'barcode'} type={type} min={type === 'number' ? 0 : undefined} value={String(editing?.[key] ?? '')} onChange={(event) => setEditing((current) => current ? { ...current, [key]: type === 'number' ? Number(event.target.value) : event.target.value } : current)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3" /></label>;
  return <section className="space-y-5" dir="rtl">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">المخزون والمنتجات</h2><p className="mt-1 text-sm text-slate-500">من هنا تضيف الأصناف وتحدد سعر البيع والشراء وبيانات الوسائط.</p></div><button onClick={() => setEditing(blank())} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white">+ إضافة صنف جديد</button></div>
    {editing && <form onSubmit={saveProduct} className="panel grid gap-4 p-5 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><h3 className="font-bold">{products.some((product) => product.id === editing.id) ? `تعديل: ${editing.name}` : 'إضافة صنف جديد'}</h3><button type="button" onClick={() => setEditing(null)} className="text-sm text-slate-500">إلغاء</button></div>{field('اسم الصنف', 'name')}{field('التصنيف', 'category')}{field('الباركود', 'barcode')}{field('سعر البيع', 'price', 'number')}{field('سعر الشراء', 'cost', 'number')}{field('الكمية الحالية', 'stock', 'number')}{field('المواصفات', 'spec', 'text', true)}<div className="space-y-2 sm:col-span-2"><p className="text-sm font-semibold">صورة الصنف <span className="font-normal text-slate-500">(اختياري: ارفع ملفاً أو اكتب رابطاً)</span></p>{field('رابط الصورة', 'imageUrl', 'url', true)}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(file, 'image'); }} className="block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm" /></div><div className="space-y-2 sm:col-span-2"><p className="text-sm font-semibold">فيديو الصنف <span className="font-normal text-slate-500">(اختياري: ارفع ملفاً أو اكتب رابطاً)</span></p>{field('رابط الفيديو', 'videoUrl', 'url', true)}<input type="file" accept="video/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(file, 'video'); }} className="block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm" /></div>{(editing.imageUrl || editing.videoUrl) && <div className="flex flex-wrap gap-3 sm:col-span-2">{editing.imageUrl && <img src={editing.imageUrl} alt="معاينة الصنف" className="h-24 w-24 rounded-lg object-cover" />}{editing.videoUrl && <video src={editing.videoUrl} controls className="h-24 w-40 rounded-lg object-cover" />}</div>}<button disabled={saving} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50 sm:col-span-2">{saving ? 'جارٍ رفع الملف أو الحفظ...' : 'حفظ بيانات الصنف'}</button></form>}
    <section className="panel overflow-x-auto"><table className="w-full min-w-[850px] text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-4">الصنف</th><th className="p-4">سعر الشراء</th><th className="p-4">سعر البيع</th><th className="p-4">المخزون</th><th className="p-4">الوسائط</th><th className="p-4">الإجراءات</th></tr></thead><tbody className="divide-y divide-slate-100">{products.map((product) => <tr key={product.id}><td className="p-4"><div className="flex items-center gap-3">{product.imageUrl ? <img src={product.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-orange-50" />}<div><p className="font-semibold">{product.name}</p><p className="text-xs text-slate-500">{product.category}</p></div></div></td><td className="p-4">{money(product.cost)}</td><td className="p-4 text-orange-600">{money(product.price)}</td><td className="p-4">{product.stock}</td><td className="p-4">{product.imageUrl ? 'صورة ' : ''}{product.videoUrl ? 'فيديو' : !product.imageUrl ? 'بدون' : ''}</td><td className="space-x-2 space-x-reverse p-4"><button onClick={() => setEditing({ ...product })} className="text-orange-600">تعديل</button><button onClick={() => deleteProduct(product.id)} className="text-rose-600">حذف</button></td></tr>)}</tbody></table></section>
  </section>;
}

function PurchaseInvoicesPage() {
  const { products, setProducts, purchases, setPurchases } = useAppData();
  const [productId, setProductId] = useState(products[0]?.id ?? 0); const [quantity, setQuantity] = useState(1); const [unitCost, setUnitCost] = useState(products[0]?.cost ?? 0); const [supplier, setSupplier] = useState(''); const selectedProduct = products.find((item) => item.id === productId);
  const submitPurchase = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!selectedProduct || quantity < 1 || unitCost < 0) return; const invoice: PurchaseInvoice = { id: `#PUR-${Date.now()}`, date: today(), supplier: supplier.trim() || 'مورد نقدي', productName: selectedProduct.name, quantity, unitCost, total: quantity * unitCost }; setProducts((current) => current.map((item) => item.id === productId ? { ...item, stock: item.stock + quantity, cost: unitCost } : item)); setPurchases((current) => [invoice, ...current]); setQuantity(1); setSupplier(''); window.alert('تم تسجيل فاتورة الشراء وزيادة المخزون.'); };
  return <><form onSubmit={submitPurchase} className="panel grid max-w-3xl gap-4 p-5 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">إدخال فاتورة شراء</h2><label className="text-sm sm:col-span-2">المنتج<select value={productId} onChange={(event) => { const id = Number(event.target.value); setProductId(id); setUnitCost(products.find((item) => item.id === id)?.cost ?? 0); }} className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3">{products.map((product) => <option key={product.id} value={product.id}>{product.name} · المخزون {product.stock}</option>)}</select></label><label className="text-sm">المورد<input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3" placeholder="اسم المورد" /></label><label className="text-sm">الكمية المشتراة<input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3" /></label><label className="text-sm">تكلفة الوحدة<input type="number" min="0" required value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3" /></label><p className="self-end font-bold">الإجمالي: {money(quantity * unitCost)}</p><button className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white sm:col-span-2">حفظ الفاتورة وزيادة المخزون</button></form><section className="panel overflow-x-auto"><h2 className="p-5 font-bold">سجل فواتير الشراء</h2><table className="w-full min-w-[650px] text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-4">رقم الفاتورة</th><th className="p-4">التاريخ</th><th className="p-4">المورد</th><th className="p-4">الصنف والكمية</th><th className="p-4">الإجمالي</th></tr></thead><tbody className="divide-y divide-slate-100">{purchases.map((invoice) => <tr key={invoice.id}><td className="p-4">{invoice.id}</td><td className="p-4">{invoice.date}</td><td className="p-4">{invoice.supplier}</td><td className="p-4">{invoice.productName} × {invoice.quantity}</td><td className="p-4 font-semibold">{money(invoice.total)}</td></tr>)}</tbody></table></section></>;
}

function ReportsPage() {
  const { sales, purchases } = useAppData(); const totalSales = sales.reduce((sum, invoice) => sum + invoice.total, 0); const totalPurchases = purchases.reduce((sum, invoice) => sum + invoice.total, 0); const profit = sales.reduce((sum, invoice) => sum + invoice.total - invoice.cost_total, 0);
  return <><h2 className="text-lg font-bold">التقارير المالية</h2><div className="grid gap-4 sm:grid-cols-3"><Metric title="إجمالي المبيعات المسجلة" value={money(totalSales)} icon={ShoppingBag} /><Metric title="إجمالي المشتريات المسجلة" value={money(totalPurchases)} icon={ClipboardList} /><Metric title="صافي ربح المبيعات" value={money(profit)} icon={TrendingUp} /></div><p className="panel p-4 text-sm leading-6 text-slate-600">صافي ربح المبيعات محسوب هنا كإجمالي البيع ناقص تكلفة البضاعة المباعة المسجلة في فواتير البيع. لا تُطرح قيمة فواتير الشراء مرة ثانية من الربح، لتجنب احتساب تكلفة المخزون مرتين. الأرقام تجريبية وليست تقريراً محاسبياً نهائياً.</p></>;
}

function AdsPage() {
  const { ads, setAds } = useAppData(); const saveAd = (ad: Ad) => { setAds((current) => current.some((item) => item.id === ad.id) ? current.map((item) => item.id === ad.id ? ad : item) : [ad, ...current]); }; const toggleAd = (id: string) => { setAds((current) => current.map((ad) => ad.id === id ? { ...ad, is_active: !ad.is_active } : ad)); }; const deleteAd = (id: string) => { setAds((current) => current.filter((ad) => ad.id !== id)); };
  return <AdsManager ads={ads} onSave={saveAd} onToggle={toggleAd} onDelete={deleteAd} />;
}

function NotFound() { return <main dir="rtl" className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><h1 className="text-2xl font-bold">الصفحة غير موجودة</h1><Link to="/" className="mt-4 inline-flex items-center gap-2 text-orange-600"><ArrowRight size={16} />العودة إلى المتجر</Link></div></main>; }
