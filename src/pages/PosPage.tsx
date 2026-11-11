import { useMemo, useState } from 'react';
import {
  Banknote,
  Barcode,
  Check,
  CreditCard,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  WalletCards,
} from 'lucide-react';
import type { Product, SalesInvoice } from '../data/mock';

type CartLine = { product: Product; quantity: number };
type PaymentMethod = 'cash' | 'card' | 'transfer';

type PosPageProps = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSales: React.Dispatch<React.SetStateAction<SalesInvoice[]>>;
};

const money = (value: number) => `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(value)} ر.س`;
const today = () => new Date().toISOString().slice(0, 10);
const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  transfer: 'تحويل بنكي',
};

export default function PosPage({ products, setProducts, setSales }: PosPageProps) {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(15);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [paid, setPaid] = useState(0);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      `${product.name} ${product.barcode} ${product.category}`.toLowerCase().includes(normalized),
    );
  }, [products, query]);

  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = subtotal - safeDiscount;
  const tax = Math.round(taxable * Math.min(Math.max(taxRate, 0), 100) / 100);
  const total = taxable + tax;
  const change = Math.max(paid - total, 0);

  const addToCart = (product: Product) => {
    if (product.stock < 1) return;
    setCart((current) => {
      const found = current.find((line) => line.product.id === product.id);
      if (found) {
        if (found.quantity >= product.stock) return current;
        return current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, nextQuantity: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    if (nextQuantity < 1) {
      setCart((current) => current.filter((line) => line.product.id !== productId));
      return;
    }
    setCart((current) => current.map((line) => line.product.id === productId
      ? { ...line, quantity: Math.min(nextQuantity, product.stock) }
      : line));
  };

  const createSale = () => {
    if (!cart.length) {
      window.alert('أضف منتجاً واحداً على الأقل إلى الفاتورة.');
      return;
    }
    if (paid < total) {
      window.alert(`المبلغ المدفوع أقل من الإجمالي. المتبقي ${money(total - paid)}.`);
      return;
    }

    const invoiceId = `#INV-${Date.now()}`;
    setProducts((current) => current.map((product) => {
      const line = cart.find((item) => item.product.id === product.id);
      return line ? { ...product, stock: product.stock - line.quantity } : product;
    }));
    setSales((current) => [{
      id: invoiceId,
      date: today(),
      total,
      cost_total: cart.reduce((sum, line) => sum + line.product.cost * line.quantity, 0),
      customer: customer.trim() || 'عميل نقدي',
      phone: phone.trim(),
      payment_method: paymentMethod,
      items_count: cart.reduce((sum, line) => sum + line.quantity, 0),
      discount: safeDiscount,
      tax,
    }, ...current]);
    setLastInvoice(invoiceId);
    setCart([]);
    setDiscount(0);
    setPaid(0);
    setCustomer('');
    setPhone('');
    window.alert(`تم تسجيل الفاتورة ${invoiceId} بنجاح.`);
  };

  return (
    <section className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">المبيعات والفواتير</p>
          <h2 className="mt-1 text-2xl font-bold">نقطة البيع</h2>
        </div>
        {lastInvoice && <p className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><Check size={14} className="ml-1 inline" />آخر فاتورة {lastInvoice}</p>}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="relative">
              <Search className="absolute right-3 top-3.5 text-slate-400" size={19} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث باسم المنتج أو الباركود..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 outline-none transition focus:border-orange-400 focus:bg-white"
                autoFocus
              />
              <Barcode className="absolute left-3 top-3.5 text-slate-400" size={19} />
            </div>
            <p className="mt-3 text-xs text-slate-500">{filteredProducts.length} منتج ظاهر · انقر على المنتج لإضافته إلى الفاتورة</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const unavailable = product.stock < 1;
              const inCart = cart.find((line) => line.product.id === product.id)?.quantity ?? 0;
              return (
                <button key={product.id} disabled={unavailable} onClick={() => addToCart(product)} className="panel overflow-hidden text-right transition hover:-translate-y-0.5 hover:border-orange-300 disabled:cursor-not-allowed disabled:opacity-50">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-32 w-full object-cover" /> : <div className={`flex h-32 items-center justify-center ${product.surface}`}><product.icon size={44} className={product.tint} /></div>}
                  <div className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2"><span className="text-xs text-slate-500">{product.category}</span>{inCart > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">{inCart}</span>}</div>
                    <h3 className="line-clamp-1 text-sm font-bold">{product.name}</h3>
                    <div className="flex items-center justify-between"><strong className="text-orange-600">{money(product.price)}</strong><span className={`text-xs ${product.stock < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>المتاح {product.stock}</span></div>
                  </div>
                </button>
              );
            })}
          </div>
          {!filteredProducts.length && <div className="panel p-10 text-center text-sm text-slate-500">لا توجد منتجات مطابقة للبحث.</div>}
        </div>

        <aside className="panel h-fit overflow-hidden xl:sticky xl:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 p-5"><div className="flex items-center gap-2"><ShoppingCart className="text-orange-500" size={20} /><h3 className="font-bold">الفاتورة الحالية</h3></div><span className="text-xs text-slate-500">{cart.reduce((sum, line) => sum + line.quantity, 0)} أصناف</span></div>
          <div className="max-h-[310px] space-y-3 overflow-y-auto p-4">
            {cart.length ? cart.map((line) => <div key={line.product.id} className="rounded-xl bg-slate-50 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{line.product.name}</p><p className="mt-1 text-xs text-slate-500">{money(line.product.price)} للوحدة</p></div><button onClick={() => updateQuantity(line.product.id, 0)} aria-label="حذف المنتج" className="text-rose-500"><Trash2 size={16} /></button></div><div className="mt-3 flex items-center justify-between"><strong className="text-sm">{money(line.product.price * line.quantity)}</strong><div className="flex items-center gap-2 rounded-lg border bg-white p-1"><button onClick={() => updateQuantity(line.product.id, line.quantity - 1)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><Minus size={14} /></button><span className="min-w-5 text-center text-sm">{line.quantity}</span><button onClick={() => updateQuantity(line.product.id, line.quantity + 1)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><Plus size={14} /></button></div></div></div>) : <div className="py-12 text-center text-sm text-slate-400">السلة فارغة<br /><span className="text-xs">اختر منتجاً من القائمة</span></div>}
          </div>

          <div className="space-y-3 border-t border-slate-100 p-4">
            <div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-500">الخصم (ر.س)<input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label><label className="text-xs text-slate-500">الضريبة %<input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label></div>
            <div className="space-y-2 text-sm"><div className="flex justify-between text-slate-500"><span>المجموع الفرعي</span><span>{money(subtotal)}</span></div><div className="flex justify-between text-rose-500"><span>الخصم</span><span>- {money(safeDiscount)}</span></div><div className="flex justify-between text-slate-500"><span>الضريبة</span><span>{money(tax)}</span></div><div className="flex justify-between border-t pt-3 text-lg font-bold"><span>الإجمالي</span><span className="text-orange-600">{money(total)}</span></div></div>
            <div className="grid grid-cols-3 gap-2"><button onClick={() => setPaymentMethod('cash')} className={`rounded-lg border p-2 text-xs ${paymentMethod === 'cash' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'text-slate-500'}`}><Banknote className="mx-auto mb-1" size={17} />نقدي</button><button onClick={() => setPaymentMethod('card')} className={`rounded-lg border p-2 text-xs ${paymentMethod === 'card' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'text-slate-500'}`}><CreditCard className="mx-auto mb-1" size={17} />بطاقة</button><button onClick={() => setPaymentMethod('transfer')} className={`rounded-lg border p-2 text-xs ${paymentMethod === 'transfer' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'text-slate-500'}`}><WalletCards className="mx-auto mb-1" size={17} />تحويل</button></div>
            <div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-500"><UserRound size={14} className="ml-1 inline" />اسم العميل<input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="عميل نقدي" className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label><label className="text-xs text-slate-500">رقم الهاتف<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="اختياري" className="mt-1 h-10 w-full rounded-lg border px-2 text-sm" /></label></div>
            <label className="block text-xs text-slate-500">المبلغ المدفوع<input type="number" min="0" value={paid} onChange={(e) => setPaid(Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border px-3 text-sm" /></label>
            <div className="flex justify-between rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><span>الباقي</span><span>{money(change)}</span></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={createSale} className="rounded-xl bg-orange-500 px-3 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"><Check className="ml-1 inline" size={16} />تسجيل البيع</button><button onClick={() => window.print()} disabled={!cart.length} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"><Printer className="ml-1 inline" size={16} />طباعة</button></div>
            <p className="text-center text-[11px] text-slate-400">طريقة الدفع: {paymentLabels[paymentMethod]} · الضريبة قابلة للتعديل</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
