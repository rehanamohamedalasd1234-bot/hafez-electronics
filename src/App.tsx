import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
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
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import AdsManager from './pages/AdsManager';
import AdsCarousel from './components/AdsCarousel';
import {
  initialAds,
  initialProducts,
  recentInvoices,
  type Ad,
  type Product,
} from './data/mock';

type Page = 'overview' | 'pos' | 'inventory' | 'invoices' | 'ads' | 'store';

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'pos', label: 'نقطة البيع', icon: ShoppingCart },
  { id: 'inventory', label: 'المخزون والمنتجات', icon: Boxes },
  { id: 'invoices', label: 'الفواتير', icon: ClipboardList },
  { id: 'ads', label: 'إدارة الإعلانات', icon: Tag },
  { id: 'store', label: 'واجهة المتجر', icon: ShoppingBag },
];

const currency = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 });
const money = (value: number) => `${currency.format(value)} ر.س`;

function App() {
  const [page, setPage] = useState<Page>('overview');
  const [products, setProducts] = useState(initialProducts);
  const [ads, setAds] = useState(initialAds);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.category} ${product.barcode}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [products, query],
  );

  const cartItems = products.filter((product) => cart[product.id]);
  const cartTotal = cartItems.reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0,
  );
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const addToCart = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
  };

  const changeQuantity = (id: number, amount: number) => {
    setCart((current) => {
      const next = { ...current, [id]: (current[id] ?? 0) + amount };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  };

  const checkout = () => {
    if (!cartCount) return;

    setProducts((current) =>
      current.map((product) => ({
        ...product,
        stock: Math.max(0, product.stock - (cart[product.id] ?? 0)),
      })),
    );
    setCart({});
    flash('تم تسجيل الفاتورة بنجاح — بيانات تجريبية');
  };

  const saveAd = (ad: Ad) => {
    setAds((current) => {
      const exists = current.some((item) => item.id === ad.id);
      return exists
        ? current.map((item) => (item.id === ad.id ? ad : item))
        : [ad, ...current];
    });
    flash('تم حفظ الإعلان — بيانات تجريبية');
  };

  const toggleAd = (id: string) => {
    setAds((current) =>
      current.map((ad) =>
        ad.id === id ? { ...ad, is_active: !ad.is_active } : ad,
      ),
    );
  };

  const deleteAd = (id: string) => {
    setAds((current) => current.filter((ad) => ad.id !== id));
    flash('تم حذف الإعلان من البيانات التجريبية');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`sidebar fixed inset-y-0 right-0 z-30 flex w-[260px] flex-col bg-[#101828] text-white transition-transform duration-300 ${
          mobileNav ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500">
            <Zap size={23} fill="white" />
          </div>
          <div>
            <p className="font-bold">حافظ للإلكترونيات</p>
            <p className="mt-0.5 text-xs text-slate-400">النظام الإداري</p>
          </div>
          <button
            className="mr-auto text-slate-400 lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">حالة النظام</span>
            <span className="text-xs font-medium text-emerald-400">● تجريبي</span>
          </div>
          <p className="mt-2 text-xs text-slate-300">البيانات محلية وغير محفوظة</p>
        </div>

        <nav className="space-y-1 px-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold tracking-widest text-slate-500">
            القائمة الرئيسية
          </p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setPage(id);
                setMobileNav(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                page === id
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 text-xs text-slate-400">
          معاينة أولية · حافظ للإلكترونيات
        </div>
      </aside>

      {mobileNav && (
        <button
          className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-label="إغلاق القائمة"
        />
      )}

      <main className="min-h-screen lg:mr-[260px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="فتح القائمة"
            >
              <Menu size={21} />
            </button>
            <div>
              <h1 className="text-base font-bold sm:text-lg">{pageTitle(page)}</h1>
              <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                أهلاً بك في متجرك · وضع تجريبي
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Smartphone size={18} className="text-slate-500" />
            حافظ للإلكترونيات
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-9">
          {page === 'overview' && (
            <Overview products={products} onNavigate={setPage} />
          )}

          {page === 'pos' && (
            <Pos
              products={filteredProducts}
              cart={cart}
              query={query}
              setQuery={setQuery}
              addToCart={addToCart}
              changeQuantity={changeQuantity}
              cartItems={cartItems}
              cartTotal={cartTotal}
              checkout={checkout}
            />
          )}

          {page === 'inventory' && (
            <Inventory
              products={filteredProducts}
              query={query}
              setQuery={setQuery}
            />
          )}

          {page === 'invoices' && <Invoices />}

          {page === 'ads' && (
            <AdsManager
              ads={ads}
              onSave={saveAd}
              onToggle={toggleAd}
              onDelete={deleteAd}
            />
          )}

          {page === 'store' && (
            <Storefront
              products={products}
              ads={ads}
              addToCart={(product) => {
                addToCart(product);
                flash('أُضيف المنتج إلى سلة المعاينة');
              }}
            />
          )}
        </div>
      </main>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
        >
          <Check size={17} className="text-emerald-400" />
          {notice}
        </div>
      )}
    </div>
  );
}

function pageTitle(page: Page) {
  return {
    overview: 'نظرة عامة',
    pos: 'نقطة البيع',
    inventory: 'المخزون والمنتجات',
    invoices: 'الفواتير',
    ads: 'إدارة الإعلانات',
    store: 'واجهة المتجر',
  }[page];
}

function Overview({
  products,
  onNavigate,
}: {
  products: Product[];
  onNavigate: (page: Page) => void;
}) {
  const lowStock = products.filter((product) => product.stock < 5);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#162237] p-7 text-white sm:p-9">
        <p className="text-sm text-slate-300">ملخص أداء المتجر</p>
        <h2 className="mt-3 text-2xl font-bold">كل تفاصيل متجرك في مكان واحد.</h2>
        <p className="mt-2 text-sm text-slate-300">
          لوحة معاينة تستخدم بيانات تجريبية.
        </p>
        <button
          onClick={() => onNavigate('pos')}
          className="mt-5 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold"
        >
          ابدأ عملية بيع <ArrowDownLeft className="mr-1 inline" size={16} />
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="مبيعات اليوم" value={money(12450)} icon={CircleDollarSign} />
        <Metric title="إجمالي الطلبات" value="24" icon={ShoppingBag} />
        <Metric title="صافي الأرباح" value={money(3280)} icon={TrendingUp} />
        <Metric title="قيمة المخزون" value={money(86400)} icon={Wallet} />
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">تنبيهات المخزون</h3>
            <p className="mt-1 text-xs text-slate-400">أصناف منخفضة الكمية</p>
          </div>
          <AlertTriangle className="text-amber-500" size={20} />
        </div>
        <div className="mt-4 space-y-3">
          {lowStock.length ? (
            lowStock.map((product) => (
              <div key={product.id} className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span>{product.name}</span>
                <span className="font-semibold text-rose-600">{product.stock} قطع</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">المخزون بحالة جيدة.</p>
          )}
        </div>
        <button
          onClick={() => onNavigate('ads')}
          className="mt-5 text-sm font-semibold text-orange-600"
        >
          إدارة الإعلانات ←
        </button>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs">{title}</span>
        <Icon size={20} className="text-orange-500" />
      </div>
      <p className="mt-4 text-xl font-bold">{value}</p>
      <p className="mt-2 text-[10px] text-slate-400">بيانات تجريبية</p>
    </div>
  );
}

function Pos({
  products,
  cart,
  query,
  setQuery,
  addToCart,
  changeQuantity,
  cartItems,
  cartTotal,
  checkout,
}: {
  products: Product[];
  cart: Record<number, number>;
  query: string;
  setQuery: (value: string) => void;
  addToCart: (product: Product) => void;
  changeQuantity: (id: number, amount: number) => void;
  cartItems: Product[];
  cartTotal: number;
  checkout: () => void;
}) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <label className="relative block">
          <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن منتج أو باركود..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 text-sm outline-none focus:border-orange-400"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="panel flex items-center gap-3 p-4 text-right hover:border-orange-300"
            >
              <product.icon size={25} className="text-orange-600" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{product.name}</span>
                <span className="mt-1 block text-xs text-slate-400">
                  المتوفر: {product.stock}
                </span>
              </span>
              <span className="text-sm font-bold">{money(product.price)}</span>
            </button>
          ))}
        </div>
        {!products.length && <p className="panel p-8 text-center text-sm text-slate-400">لا توجد منتجات مطابقة.</p>}
      </section>

      <aside className="panel p-5 xl:sticky xl:top-24">
        <h3 className="font-bold">الفاتورة الحالية</h3>
        <div className="my-4 space-y-3">
          {cartItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">أضف منتجات لبدء الفاتورة.</p>
          ) : (
            cartItems.map((product) => (
              <div key={product.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 text-xs font-semibold">{product.name}</span>
                <button onClick={() => changeQuantity(product.id, -1)} aria-label="إنقاص الكمية">
                  <Minus size={16} />
                </button>
                <span className="text-xs">{cart[product.id]}</span>
                <button onClick={() => changeQuantity(product.id, 1)} aria-label="زيادة الكمية">
                  <Plus size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between border-t border-slate-100 py-4 text-sm">
          <span>الإجمالي</span>
          <strong>{money(cartTotal)}</strong>
        </div>
        <button
          onClick={checkout}
          disabled={!cartItems.length}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          <CreditCard size={17} />
          إتمام البيع
        </button>
        <button
          onClick={() => window.print()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs"
        >
          <Printer size={15} />
          طباعة
        </button>
      </aside>
    </div>
  );
}

function Inventory({
  products,
  query,
  setQuery,
}: {
  products: Product[];
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ابحث في المنتجات..."
        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm sm:max-w-sm"
      />
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[600px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-4">المنتج</th>
              <th className="p-4">الباركود</th>
              <th className="p-4">التصنيف</th>
              <th className="p-4">السعر</th>
              <th className="p-4">المخزون</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="p-4 font-semibold">{product.name}</td>
                <td className="p-4">{product.barcode}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">{money(product.price)}</td>
                <td className="p-4">{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Invoices() {
  return (
    <div className="panel overflow-x-auto">
      <div className="p-5">
        <h2 className="font-bold">آخر الفواتير</h2>
        <p className="mt-1 text-xs text-slate-400">بيانات عرض تجريبية</p>
      </div>
      <table className="w-full min-w-[600px] text-right text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="p-4">رقم الفاتورة</th>
            <th className="p-4">العميل</th>
            <th className="p-4">التاريخ</th>
            <th className="p-4">الإجمالي</th>
            <th className="p-4">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {recentInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="p-4 font-semibold">{invoice.id}</td>
              <td className="p-4">{invoice.customer}</td>
              <td className="p-4">{invoice.date}</td>
              <td className="p-4">{money(invoice.total)}</td>
              <td className="p-4">{invoice.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Storefront({
  products,
  ads,
  addToCart,
}: {
  products: Product[];
  ads: Ad[];
  addToCart: (product: Product) => void;
}) {
  return (
    <div className="space-y-6">
      <AdsCarousel ads={ads} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold">منتجات المتجر</h2>
          <p className="mt-1 text-xs text-slate-400">واجهة متجر تجريبية</p>
        </div>
        <span className="text-xs text-slate-500">
          <ChevronDown className="ml-1 inline" size={14} />
          منتجات مميزة
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="panel overflow-hidden">
            <div className="flex h-36 items-center justify-center bg-slate-100">
              <product.icon size={56} className="text-slate-600" />
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-400">{product.category}</p>
              <h3 className="mt-1 font-bold">{product.name}</h3>
              <p className="mt-2 text-xs text-slate-500">{product.spec}</p>
              <div className="mt-4 flex items-center justify-between">
                <strong className="text-orange-600">{money(product.price)}</strong>
                <button
                  onClick={() => addToCart(product)}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                >
                  أضف للسلة
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default App;
