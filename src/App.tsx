import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpLeft,
  Barcode,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Headphones,
  LayoutDashboard,
  Menu,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Tag,
  Trash2,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { initialProducts, recentInvoices, type Product } from './data/mock';

type Page = 'overview' | 'pos' | 'inventory' | 'invoices' | 'store';

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'pos', label: 'نقطة البيع', icon: ShoppingCart },
  { id: 'inventory', label: 'المخزون والمنتجات', icon: Boxes },
  { id: 'invoices', label: 'الفواتير', icon: ClipboardList },
  { id: 'store', label: 'واجهة المتجر', icon: ShoppingBag },
];

const currency = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 });
const money = (value: number) => `${currency.format(value)} ر.س`;

function App() {
  const [page, setPage] = useState<Page>('overview');
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const filteredProducts = useMemo(() => products.filter((product) =>
    `${product.name} ${product.category} ${product.barcode}`.toLowerCase().includes(query.toLowerCase()),
  ), [products, query]);
  const cartItems = products.filter((product) => cart[product.id]);
  const cartTotal = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  const addToCart = (product: Product) => setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
  const changeQuantity = (id: number, amount: number) => setCart((current) => {
    const next = { ...current, [id]: (current[id] ?? 0) + amount };
    if (next[id] <= 0) delete next[id];
    return next;
  });
  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };
  const checkout = () => {
    if (!cartCount) return;
    setProducts((current) => current.map((product) => ({ ...product, stock: Math.max(0, product.stock - (cart[product.id] ?? 0)) })));
    setCart({});
    flash('تم تسجيل الفاتورة بنجاح — بيانات تجريبية');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className={`sidebar fixed inset-y-0 right-0 z-30 flex w-[260px] flex-col bg-[#101828] text-white transition-transform duration-300 ${mobileNav ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20"><Zap size={23} fill="white" /></div>
          <div><p className="font-bold tracking-tight">حافظ للإلكترونيات</p><p className="mt-0.5 text-xs text-slate-400">النظام الإداري</p></div>
          <button className="mr-auto text-slate-400 lg:hidden" onClick={() => setMobileNav(false)} aria-label="إغلاق القائمة"><X size={20} /></button>
        </div>
        <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between"><span className="text-xs text-slate-400">حالة النظام</span><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />متصل</span></div>
          <p className="mt-2 text-xs text-slate-300">وضع تجريبي · البيانات محلية</p>
        </div>
        <nav className="space-y-1 px-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold tracking-[0.18em] text-slate-500">القائمة الرئيسية</p>
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setPage(id); setMobileNav(false); }} className={`nav-link flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${page === id ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/30' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'pos' && <span className="mr-auto rounded-md bg-white/15 px-1.5 py-0.5 text-[10px]">F2</span>}</button>)}
        </nav>
        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Headphones size={18} /></div><p className="text-sm font-semibold">تحتاج إلى مساعدة؟</p><p className="mt-1 text-xs leading-5 text-slate-400">فريقنا جاهز لمساعدتك في إدارة متجرك.</p><button className="mt-3 text-xs font-semibold text-orange-300" onClick={() => flash('سيتم تفعيل الدعم لاحقاً')}>تواصل مع الدعم ←</button></div>
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-1 pt-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">ح</div><div className="min-w-0"><p className="truncate text-xs font-semibold">مالك المتجر</p><p className="mt-0.5 truncate text-[10px] text-slate-400">وضع المعاينة</p></div><ChevronDown className="mr-auto text-slate-400" size={15} /></div>
        </div>
      </aside>

      {mobileNav && <button className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden" onClick={() => setMobileNav(false)} aria-label="إغلاق القائمة" />}
      <main className="min-h-screen lg:mr-[260px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7 lg:px-9">
          <div className="flex items-center gap-3"><button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNav(true)} aria-label="فتح القائمة"><Menu size={21} /></button><div><h1 className="text-base font-bold sm:text-lg">{pageTitle(page)}</h1><p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">الثلاثاء، ١٠ نوفمبر ٢٠٢٦ · أهلاً بك في متجرك</p></div></div>
          <div className="flex items-center gap-2 sm:gap-3"><button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="الإشعارات" onClick={() => flash('لا توجد إشعارات جديدة')}><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-white" /></button><div className="hidden h-8 w-px bg-slate-200 sm:block" /><div className="flex items-center gap-2"><div className="hidden text-left sm:block"><p className="text-xs font-semibold">حافظ للإلكترونيات</p><p className="mt-0.5 text-[10px] text-slate-400">الفرع الرئيسي</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Smartphone size={17} /></div></div></div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-9">
          {page === 'overview' && <Overview products={products} onNavigate={setPage} />}
          {page === 'pos' && <Pos products={filteredProducts} cart={cart} query={query} setQuery={setQuery} addToCart={addToCart} changeQuantity={changeQuantity} cartItems={cartItems} cartTotal={cartTotal} checkout={checkout} />}
          {page === 'inventory' && <Inventory products={products} query={query} setQuery={setQuery} />}
          {page === 'invoices' && <Invoices />}
          {page === 'store' && <Storefront products={products} addToCart={(product) => { addToCart(product); flash('أُضيف المنتج إلى سلة المعاينة'); }} />}
        </div>
      </main>
      {notice && <div role="status" className="fixed bottom-5 left-5 z-50 flex max-w-[calc(100%-2.5rem)] items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><Check size={17} className="text-emerald-400" />{notice}</div>}
    </div>
  );
}

function pageTitle(page: Page) { return ({ overview: 'نظرة عامة', pos: 'نقطة البيع', inventory: 'المخزون والمنتجات', invoices: 'الفواتير', store: 'واجهة المتجر' })[page]; }

function Overview({ products, onNavigate }: { products: Product[]; onNavigate: (page: Page) => void }) {
  const lowStock = products.filter((product) => product.stock < 5);
  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[24px] bg-[#162237] px-6 py-7 text-white sm:px-9 sm:py-9"><div className="relative z-[1] max-w-xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] text-slate-200"><CalendarDays size={13} />ملخص أداء المتجر</div><h2 className="text-2xl font-bold leading-relaxed sm:text-[30px]">كل تفاصيل متجرك،<br className="sm:hidden" /> في مكان واحد.</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-300">تابع المبيعات والمخزون وأداء منتجاتك بسهولة. هذه لوحة معاينة ببيانات تجريبية.</p><button onClick={() => onNavigate('pos')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-orange-950/30 transition hover:bg-orange-400">ابدأ عملية بيع <ArrowDownLeft size={16} /></button></div><div className="pointer-events-none absolute -left-7 -top-20 h-72 w-72 rounded-full border-[40px] border-white/[0.035]"/><div className="pointer-events-none absolute -left-16 -top-10 h-64 w-64 rounded-full border border-white/[0.07]"/><Zap className="absolute bottom-[-20px] left-[12%] rotate-[-18deg] text-white/[0.045]" size={190} fill="currentColor" /></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric title="مبيعات اليوم" value={money(12450)} trend="12.8%" icon={CircleDollarSign} color="orange" note="مقارنة بالأمس" />
      <Metric title="إجمالي الطلبات" value="24" trend="8.2%" icon={ShoppingBag} color="blue" note="مقارنة بالأمس" />
      <Metric title="صافي الأرباح" value={money(3280)} trend="6.4%" icon={TrendingUp} color="green" note="مقارنة بالأمس" />
      <Metric title="قيمة المخزون" value={money(86400)} icon={Wallet} color="purple" note="18 صنفاً في المخزون" />
    </section>
    <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div className="panel p-5 sm:p-6"><div className="mb-6 flex items-start justify-between"><div><h3 className="font-bold">نظرة على المبيعات</h3><p className="mt-1 text-xs text-slate-400">أداء المبيعات خلال هذا الأسبوع</p></div><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">هذا الأسبوع <ChevronDown size={13} className="mr-2 inline" /></button></div><div className="flex h-[210px] items-end justify-between gap-2 border-b border-slate-100 px-1 pb-2 sm:px-3">{[42, 63, 49, 77, 57, 91, 68].map((height, index) => <div key={index} className="group flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative w-full max-w-[42px] rounded-t-lg bg-orange-100 transition hover:bg-orange-200" style={{ height: `${height}%` }}><div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-orange-500 transition-all group-hover:bg-orange-600" style={{ height: `${Math.min(height + (index === 5 ? 13 : 0), 100)}%` }} /></div><span className="text-[10px] text-slate-400">{['سبت', 'أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع'][index]}</span></div>)}</div><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-orange-500" />إجمالي هذا الأسبوع <strong className="mr-auto text-slate-800">٣٨٬٦٥٠ ر.س</strong></div></div>
      <div className="panel p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold">تنبيهات المخزون</h3><p className="mt-1 text-xs text-slate-400">أصناف تحتاج إلى انتباهك</p></div><span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-rose-50 px-2 text-xs font-bold text-rose-600">{lowStock.length}</span></div><div className="space-y-3">{lowStock.length ? lowStock.slice(0, 3).map((product) => <div key={product.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500"><product.icon size={19} /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">{product.category}</p></div><div className="text-left"><p className="text-xs font-bold text-rose-600">{product.stock} قطع</p><p className="mt-1 text-[10px] text-slate-400">متبقي</p></div></div>) : <p className="py-8 text-center text-sm text-slate-400">المخزون بحالة جيدة</p>}</div><button onClick={() => onNavigate('inventory')} className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">عرض كل المنتجات <ArrowUpLeft className="mr-1 inline" size={14} /></button></div>
    </section>
    <section className="panel overflow-hidden"><div className="flex items-center justify-between px-5 py-5 sm:px-6"><div><h3 className="font-bold">آخر الفواتير</h3><p className="mt-1 text-xs text-slate-400">أحدث عمليات البيع في متجرك</p></div><button onClick={() => onNavigate('invoices')} className="text-xs font-semibold text-orange-600">عرض الكل ←</button></div><InvoiceTable compact /></section>
  </div>;
}

function Metric({ title, value, trend, icon: Icon, color, note }: { title: string; value: string; trend?: string; icon: typeof Wallet; color: string; note: string }) {
  const colors: Record<string, string> = { orange: 'bg-orange-50 text-orange-600', blue: 'bg-blue-50 text-blue-600', green: 'bg-emerald-50 text-emerald-600', purple: 'bg-violet-50 text-violet-600' };
  return <div className="panel p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{title}</span><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}><Icon size={19} /></span></div><p className="mt-4 text-[21px] font-bold tracking-tight">{value}</p><div className="mt-2 flex items-center gap-1.5 text-[10px]">{trend && <span className="flex items-center gap-0.5 font-semibold text-emerald-600"><TrendingUp size={12} />{trend}</span>}<span className="text-slate-400">{note}</span></div></div>;
}

function Pos({ products, cart, query, setQuery, addToCart, changeQuantity, cartItems, cartTotal, checkout }: { products: Product[]; cart: Record<number, number>; query: string; setQuery: (value: string) => void; addToCart: (product: Product) => void; changeQuantity: (id: number, amount: number) => void; cartItems: Product[]; cartTotal: number; checkout: () => void }) {
  const [discount, setDiscount] = useState(0);
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-500">أنشئ فاتورة بيع بسرعة وسهولة</p></div><div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />الكاشير جاهز</div></div>
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_360px]"><section className="space-y-4"><div className="flex gap-2"><label className="relative flex-1"><Search size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن منتج أو امسح الباركود..." className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label><button className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" title="مسح الباركود"><Barcode size={20} /></button></div><div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{products.map((product) => <button key={product.id} onClick={() => addToCart(product)} className="panel group flex items-center gap-3 p-3 text-right transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"><div className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-xl ${product.surface} ${product.tint}`}><product.icon size={26} strokeWidth={1.7} /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">المتوفر: {product.stock}</p><p className="mt-2 text-xs font-bold text-orange-600">{money(product.price)}</p></div><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-orange-500 group-hover:text-white"><Plus size={16} /></span></button>)}</div>{products.length === 0 && <div className="panel py-16 text-center text-sm text-slate-400">لا توجد منتجات مطابقة لبحثك</div>}</section>
    <aside className="panel overflow-hidden xl:sticky xl:top-[96px]"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-bold">الفاتورة الحالية</h3><p className="mt-1 text-[10px] text-slate-400">فاتورة بيع · #جديدة</p></div><span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-orange-50 px-2 text-xs font-bold text-orange-600">{Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)}</span></div><div className="max-h-[340px] min-h-[150px] space-y-3 overflow-y-auto p-4">{cartItems.length === 0 ? <div className="flex h-32 flex-col items-center justify-center text-slate-400"><ShoppingCart size={25} strokeWidth={1.4} /><p className="mt-3 text-xs">أضف المنتجات لبدء الفاتورة</p></div> : cartItems.map((product) => <div key={product.id} className="flex items-center gap-2"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${product.surface} ${product.tint}`}><product.icon size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">{money(product.price)}</p></div><div className="flex items-center gap-1"><button onClick={() => changeQuantity(product.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500"><Minus size={12} /></button><span className="w-5 text-center text-xs font-semibold">{cart[product.id]}</span><button onClick={() => changeQuantity(product.id, 1)} className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500"><Plus size={12} /></button></div></div>)}</div><div className="space-y-3 border-t border-slate-100 bg-slate-50/70 p-5"><div className="flex items-center justify-between text-xs text-slate-500"><span>المجموع الفرعي</span><span>{money(cartTotal)}</span></div><label className="flex items-center justify-between text-xs text-slate-500"><span>الخصم (ر.س)</span><input type="number" min="0" max={cartTotal} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-xs outline-none focus:border-orange-400" /></label><div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3"><span className="text-sm font-bold">الإجمالي</span><strong className="text-lg text-slate-900">{money(Math.max(0, cartTotal - discount))}</strong></div><button onClick={checkout} disabled={!cartItems.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"><CreditCard size={17} />إتمام البيع</button><button onClick={() => window.print()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Printer size={15} />طباعة الفاتورة</button><p className="text-center text-[10px] text-slate-400">هذه العمليات تجريبية ولا تُحفظ على خادم.</p></div></aside></div>
  </div>;
}

function Inventory({ products, query, setQuery }: { products: Product[]; query: string; setQuery: (value: string) => void }) {
  const visible = products.filter((product) => `${product.name} ${product.category} ${product.barcode}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">تابع أصناف متجرك وكمياتها المتاحة.</p><button className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600"><Plus className="ml-1 inline" size={15} />إضافة منتج</button></div><div className="panel overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="relative w-full sm:max-w-xs"><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في المنتجات..." className="h-10 w-full rounded-lg border border-slate-200 pr-9 pl-3 text-xs outline-none focus:border-orange-400" /></div><span className="text-xs text-slate-400">{visible.length} منتجات تجريبية</span></div><div className="overflow-x-auto"><table className="w-full min-w-[690px] text-right text-xs"><thead className="bg-slate-50 text-[10px] text-slate-500"><tr><th className="px-5 py-3 font-medium">المنتج</th><th className="px-4 py-3 font-medium">الباركود</th><th className="px-4 py-3 font-medium">التصنيف</th><th className="px-4 py-3 font-medium">سعر البيع</th><th className="px-4 py-3 font-medium">الكمية</th><th className="px-5 py-3 font-medium">الحالة</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((product) => <tr key={product.id} className="hover:bg-slate-50/70"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${product.surface} ${product.tint}`}><product.icon size={17} /></span><span className="font-semibold">{product.name}</span></div></td><td className="px-4 py-3.5 text-slate-500">{product.barcode}</td><td className="px-4 py-3.5 text-slate-500">{product.category}</td><td className="px-4 py-3.5 font-semibold">{money(product.price)}</td><td className="px-4 py-3.5">{product.stock}</td><td className="px-5 py-3.5">{product.stock < 5 ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-600">مخزون منخفض</span> : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">متوفر</span>}</td></tr>)}</tbody></table></div></div><div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><span>بيانات المنتجات المعروضة للتجربة فقط. لن تتأثر قاعدة بيانات أو مخزونات حقيقية.</span></div></div>;
}

function Invoices() { return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">سجل الفواتير والعمليات الأخيرة.</p><button className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-600"><Plus className="ml-1 inline" size={15} />فاتورة جديدة</button></div><div className="grid gap-4 sm:grid-cols-3"><Metric title="فواتير اليوم" value="24" icon={ClipboardList} color="blue" note="جميع الفواتير" /><Metric title="مبيعات اليوم" value={money(12450)} icon={CircleDollarSign} color="orange" note="قبل المرتجعات" /><Metric title="مدفوعات معلقة" value="3" icon={Wallet} color="purple" note="تحتاج إلى متابعة" /></div><div className="panel overflow-hidden"><div className="flex items-center justify-between p-5"><div><h3 className="font-bold">جميع الفواتير</h3><p className="mt-1 text-xs text-slate-400">بيانات عرض تجريبية</p></div><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"><CalendarDays size={14} className="ml-2 inline" />تصفية التاريخ</button></div><InvoiceTable /></div></div>; }

function InvoiceTable({ compact = false }: { compact?: boolean }) {
  return <div className="overflow-x-auto"><table className={`w-full min-w-[620px] text-right text-xs ${compact ? '' : 'border-t border-slate-100'}`}><thead className="bg-slate-50 text-[10px] text-slate-500"><tr><th className="px-5 py-3 font-medium">رقم الفاتورة</th><th className="px-4 py-3 font-medium">العميل</th><th className="px-4 py-3 font-medium">التاريخ</th><th className="px-4 py-3 font-medium">المبلغ</th><th className="px-4 py-3 font-medium">النوع</th><th className="px-5 py-3 font-medium">الحالة</th></tr></thead><tbody className="divide-y divide-slate-100">{recentInvoices.map((invoice) => <tr key={invoice.id} className="hover:bg-slate-50/70"><td className="px-5 py-3.5 font-semibold">{invoice.id}</td><td className="px-4 py-3.5">{invoice.customer}</td><td className="px-4 py-3.5 text-slate-500">{invoice.date}</td><td className="px-4 py-3.5 font-semibold">{money(invoice.total)}</td><td className="px-4 py-3.5"><span className="flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${invoice.type === 'شراء' ? 'bg-blue-500' : 'bg-orange-500'}`} />{invoice.type}</span></td><td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${invoice.status === 'مكتملة' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{invoice.status}</span></td></tr>)}</tbody></table></div>;
}

function Storefront({ products, addToCart }: { products: Product[]; addToCart: (product: Product) => void }) {
  return <div className="space-y-5"><div className="rounded-[24px] bg-gradient-to-l from-[#162237] to-[#263956] px-6 py-8 text-white sm:px-9"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px]">حافظ للإلكترونيات الحديثة</span><h2 className="mt-4 text-2xl font-bold">تقنية تليق بك.</h2><p className="mt-2 text-sm text-slate-300">اكتشف أحدث الأجهزة والعروض — واجهة متجر تجريبية.</p><button className="mt-5 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold">اكتشف المنتجات <ArrowDownLeft className="mr-1 inline" size={14} /></button></div><div className="flex items-center justify-between"><div><h3 className="font-bold">اختياراتنا لك</h3><p className="mt-1 text-xs text-slate-400">منتجات مميزة من متجرنا</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] text-slate-500"><Tag className="ml-1 inline" size={12} />عروض مميزة</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="panel overflow-hidden"><div className={`flex h-40 items-center justify-center ${product.surface} ${product.tint}`}><product.icon size={66} strokeWidth={1.3} /></div><div className="p-4"><p className="text-[10px] text-slate-400">{product.category}</p><h4 className="mt-1 text-sm font-bold">{product.name}</h4><p className="mt-2 text-xs text-slate-500">{product.spec}</p><div className="mt-4 flex items-center justify-between"><span className="text-sm font-bold text-orange-600">{money(product.price)}</span><button onClick={() => addToCart(product)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white hover:bg-orange-500"><ShoppingCart size={13} />أضف للسلة</button></div></div></article>)}</div><p className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">معاينة فقط: تفعيل الطلبات والدفع الإلكتروني سيتم لاحقاً بعد ربط Supabase.</p></div>;
}

export default App;
