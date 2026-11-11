import { useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Minus,
  Plus,
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
  useOutletContext,
} from 'react-router-dom';
import AdsCarousel from './components/AdsCarousel';
import AdsManager from './pages/AdsManager';
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

type AppData = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  ads: Ad[];
  setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  sales: SalesInvoice[];
  setSales: React.Dispatch<React.SetStateAction<SalesInvoice[]>>;
  purchases: PurchaseInvoice[];
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseInvoice[]>>;
};

const currency = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 });
const money = (value: number) => `${currency.format(value)} ر.س`;
const today = () => new Date().toISOString().slice(0, 10);

function useAppData() {
  return useOutletContext<AppData>();
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppStateLayout />}>
          <Route index element={<Storefront />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="pos" element={<PosPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="purchases" element={<PurchaseInvoicesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="ads" element={<AdsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function AppStateLayout() {
  const [products, setProducts] = useState(initialProducts);
  const [ads, setAds] = useState(initialAds);
  const [sales, setSales] = useState(initialSales);
  const [purchases, setPurchases] = useState(initialPurchases);

  const context: AppData = {
    products,
    setProducts,
    ads,
    setAds,
    sales,
    setSales,
    purchases,
    setPurchases,
  };

  return <Outlet context={context} />;
}

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { to: '/admin', label: 'نظرة عامة', icon: LayoutDashboard, end: true },
    { to: '/admin/pos', label: 'نقطة البيع', icon: ShoppingCart },
    { to: '/admin/inventory', label: 'المخزون والمنتجات', icon: Boxes },
    { to: '/admin/purchases', label: 'فواتير الشراء', icon: ClipboardList },
    { to: '/admin/reports', label: 'التقارير', icon: TrendingUp },
    { to: '/admin/ads', label: 'إدارة الإعلانات', icon: Tag },
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
          <span className="text-xs text-slate-500">البيانات تجريبية ومحلية</span>
        </header>
        <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-7">
          <Outlet />
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
        <p className="mt-2 text-sm text-slate-300">
          المبيعات والمخزون والفواتير والإعلانات — بيانات معاينة.
        </p>
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
        <span className="text-sm">{title}</span>
        <Icon size={20} className="text-orange-500" />
      </div>
      <p className="mt-4 text-xl font-bold">{value}</p>
    </div>
  );
}

function Storefront() {
  const { products, ads } = useAppData();
  const [cart, setCart] = useState<Record<number, number>>({});
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = products.reduce(
    (sum, product) => sum + product.price * (cart[product.id] ?? 0),
    0,
  );

  const addToCart = (product: Product) => {
    if (product.stock < 1) return;
    setCart((current) => ({
      ...current,
      [product.id]: Math.min(
        product.stock,
        (current[product.id] ?? 0) + 1,
      ),
    }));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-[#101828] px-5 py-4 text-white sm:px-10">
        <Link to="/" className="text-lg font-bold">حافظ للإلكترونيات الحديثة</Link>
        <Link to="/admin" className="text-sm text-orange-300 hover:text-orange-200">
          دخول المالك
        </Link>
      </header>

      <main className="mx-auto max-w-7xl space-y-7 p-4 sm:p-8">
        <AdsCarousel ads={ads} />

        <section>
          <h1 className="text-2xl font-bold">منتجاتنا</h1>
          <p className="mt-1 text-sm text-slate-500">أحدث الأجهزة والإكسسوارات</p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const available = product.stock > 0;
            return (
              <article key={product.id} className="panel overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-52 w-full bg-slate-100 object-cover"
                  />
                ) : (
                  <div className={`flex h-52 items-center justify-center ${product.surface}`}>
                    <product.icon size={56} className={product.tint} />
                  </div>
                )}
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500">{product.category}</p>
                      <h2 className="mt-1 font-bold">{product.name}</h2>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                      available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {available ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{product.spec}</p>
                  <div className="flex items-center justify-between">
                    <strong className="text-orange-600">{money(product.price)}</strong>
                    <button
                      disabled={!available}
                      onClick={() => addToCart(product)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      أضف للسلة
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="panel flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-bold">سلة التسوق ({cartCount})</p>
            <p className="mt-1 text-sm text-slate-500">الإجمالي: {money(cartTotal)}</p>
          </div>
          <button
            disabled={!cartCount}
            onClick={() => window.alert('واجهة إتمام الطلب تجريبية — لم يتم تسجيل طلب فعلي.')}
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            إتمام الطلب
          </button>
        </section>
      </main>
    </div>
  );
}

function PosPage() {
  const { products, setProducts, setSales } = useAppData();
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [quantity, setQuantity] = useState(1);

  const product = products.find((item) => item.id === productId);
  const total = product ? product.price * quantity : 0;

  const createSale = () => {
    if (!product || quantity < 1 || quantity > product.stock) {
      window.alert('تحقق من اختيار المنتج والكمية المتاحة.');
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, stock: item.stock - quantity } : item,
      ),
    );
    setSales((current) => [
      {
        id: `#INV-${Date.now()}`,
        date: today(),
        total,
        cost_total: product.cost * quantity,
      },
      ...current,
    ]);
    setQuantity(1);
    window.alert('تم تسجيل فاتورة البيع التجريبية.');
  };

  return (
    <section className="panel max-w-2xl space-y-4 p-5">
      <h2 className="text-lg font-bold">نقطة البيع</h2>
      <label className="block text-sm">
        المنتج
        <select
          value={productId}
          onChange={(event) => setProductId(Number(event.target.value))}
          className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3"
        >
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — المتوفر {item.stock}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        الكمية
        <input
          type="number"
          min="1"
          max={product?.stock ?? 1}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3"
        />
      </label>
      <p className="font-bold">الإجمالي: {money(total)}</p>
      <button onClick={createSale} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white">
        تسجيل البيع
      </button>
    </section>
  );
}

function InventoryPage() {
  const { products, setProducts } = useAppData();
  const [editing, setEditing] = useState<Product | null>(null);

  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setProducts((current) =>
      current.map((product) => product.id === editing.id ? editing : product),
    );
    setEditing(null);
  };

  const deleteProduct = (id: number) => {
    if (!window.confirm('هل تريد حذف هذا المنتج من البيانات التجريبية؟')) return;
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  return (
    <section className="panel overflow-x-auto">
      <div className="p-5">
        <h2 className="font-bold">المخزون والمنتجات</h2>
        <p className="mt-1 text-xs text-slate-500">تعديل السعر والكمية ورابط الصورة.</p>
      </div>

      {editing && (
        <form onSubmit={saveProduct} className="grid gap-3 border-y border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
          <strong className="sm:col-span-2">تعديل: {editing.name}</strong>
          <label className="text-xs">سعر البيع
            <input type="number" min="0" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="mt-1 h-10 w-full rounded border px-2" />
          </label>
          <label className="text-xs">الكمية
            <input type="number" min="0" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="mt-1 h-10 w-full rounded border px-2" />
          </label>
          <label className="text-xs sm:col-span-2">رابط الصورة
            <input type="url" value={editing.imageUrl ?? ''} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className="mt-1 h-10 w-full rounded border px-2" />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button className="rounded bg-orange-500 px-4 py-2 text-sm text-white">حفظ</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded border px-4 py-2 text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <table className="w-full min-w-[700px] text-right text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="p-4">المنتج</th><th className="p-4">السعر</th>
            <th className="p-4">الكمية</th><th className="p-4">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-4 font-semibold">{product.name}</td>
              <td className="p-4">{money(product.price)}</td>
              <td className="p-4">{product.stock}</td>
              <td className="space-x-2 space-x-reverse p-4">
                <button onClick={() => setEditing({ ...product })} className="text-orange-600">تعديل</button>
                <button onClick={() => deleteProduct(product.id)} className="text-rose-600">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function PurchaseInvoicesPage() {
  const { products, setProducts, purchases, setPurchases } = useAppData();
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(products[0]?.cost ?? 0);
  const [supplier, setSupplier] = useState('');

  const selectedProduct = products.find((item) => item.id === productId);

  const submitPurchase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct || quantity < 1 || unitCost < 0) return;

    const invoice: PurchaseInvoice = {
      id: `#PUR-${Date.now()}`,
      date: today(),
      supplier: supplier.trim() || 'مورد نقدي',
      productName: selectedProduct.name,
      quantity,
      unitCost,
      total: quantity * unitCost,
    };

    setProducts((current) =>
      current.map((item) =>
        item.id === productId
          ? { ...item, stock: item.stock + quantity, cost: unitCost }
          : item,
      ),
    );
    setPurchases((current) => [invoice, ...current]);
    setQuantity(1);
    setSupplier('');
    window.alert('تم تسجيل فاتورة الشراء وزيادة المخزون.');
  };

  return (
    <>
      <form onSubmit={submitPurchase} className="panel grid max-w-3xl gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-bold sm:col-span-2">إدخال فاتورة شراء</h2>
        <label className="text-sm sm:col-span-2">المنتج
          <select
            value={productId}
            onChange={(event) => {
              const id = Number(event.target.value);
              setProductId(id);
              setUnitCost(products.find((item) => item.id === id)?.cost ?? 0);
            }}
            className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3"
          >
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} · المخزون {product.stock}</option>)}
          </select>
        </label>
        <label className="text-sm">المورد
          <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3" placeholder="اسم المورد" />
        </label>
        <label className="text-sm">الكمية المشتراة
          <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3" />
        </label>
        <label className="text-sm">تكلفة الوحدة
          <input type="number" min="0" required value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3" />
        </label>
        <p className="self-end font-bold">الإجمالي: {money(quantity * unitCost)}</p>
        <button className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white sm:col-span-2">
          حفظ الفاتورة وزيادة المخزون
        </button>
      </form>

      <section className="panel overflow-x-auto">
        <h2 className="p-5 font-bold">سجل فواتير الشراء</h2>
        <table className="w-full min-w-[650px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr><th className="p-4">رقم الفاتورة</th><th className="p-4">التاريخ</th><th className="p-4">المورد</th><th className="p-4">الصنف والكمية</th><th className="p-4">الإجمالي</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((invoice) => (
              <tr key={invoice.id}>
                <td className="p-4">{invoice.id}</td><td className="p-4">{invoice.date}</td>
                <td className="p-4">{invoice.supplier}</td>
                <td className="p-4">{invoice.productName} × {invoice.quantity}</td>
                <td className="p-4 font-semibold">{money(invoice.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function ReportsPage() {
  const { sales, purchases } = useAppData();
  const totalSales = sales.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPurchases = purchases.reduce((sum, invoice) => sum + invoice.total, 0);
  const profit = sales.reduce((sum, invoice) => sum + invoice.total - invoice.cost_total, 0);

  return (
    <>
      <h2 className="text-lg font-bold">التقارير المالية</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric title="إجمالي المبيعات المسجلة" value={money(totalSales)} icon={ShoppingBag} />
        <Metric title="إجمالي المشتريات المسجلة" value={money(totalPurchases)} icon={ClipboardList} />
        <Metric title="صافي ربح المبيعات" value={money(profit)} icon={TrendingUp} />
      </div>
      <p className="panel p-4 text-sm leading-6 text-slate-600">
        صافي ربح المبيعات محسوب هنا كإجمالي البيع ناقص تكلفة البضاعة المباعة المسجلة في فواتير البيع.
        لا تُطرح قيمة فواتير الشراء مرة ثانية من الربح، لتجنب احتساب تكلفة المخزون مرتين.
        الأرقام تجريبية وليست تقريرًا محاسبيًا نهائيًا.
      </p>
    </>
  );
}

function AdsPage() {
  const { ads, setAds } = useAppData();

  const saveAd = (ad: Ad) => {
    setAds((current) =>
      current.some((item) => item.id === ad.id)
        ? current.map((item) => item.id === ad.id ? ad : item)
        : [ad, ...current],
    );
  };

  const toggleAd = (id: string) => {
    setAds((current) => current.map((ad) => ad.id === id ? { ...ad, is_active: !ad.is_active } : ad));
  };

  const deleteAd = (id: string) => {
    setAds((current) => current.filter((ad) => ad.id !== id));
  };

  return <AdsManager ads={ads} onSave={saveAd} onToggle={toggleAd} onDelete={deleteAd} />;
}

function NotFound() {
  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-orange-600">
          <ArrowRight size={16} />
          العودة إلى المتجر
        </Link>
      </div>
    </main>
  );
}
