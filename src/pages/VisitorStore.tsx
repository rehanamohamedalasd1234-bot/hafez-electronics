import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Minus, PackageCheck, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Product } from '../data/mock';
import { supabase } from '../lib/supabase';

type CartItem = { productId: number; quantity: number };
export type OnlineOrder = {
  id: string;
  createdAt: string;
  status: 'new' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  customer: { name: string; phone: string; city: string; address: string; notes: string };
  paymentMethod: 'cash_on_delivery' | 'card_on_delivery';
  items: { productId: number; name: string; price: number; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
};

type VisitorProps = { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>> };
const money = (value: number) => `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 }).format(value)} ر.س`;
const cartKey = 'hafez-online-cart';
const ordersKey = 'hafez-online-orders';
const readCart = (): CartItem[] => { try { return JSON.parse(localStorage.getItem(cartKey) ?? '[]') as CartItem[]; } catch { return []; } };
const saveCart = (cart: CartItem[]) => localStorage.setItem(cartKey, JSON.stringify(cart));

function useCart(products: Product[]) {
  const [cart, setCart] = useState<CartItem[]>(readCart);
  useEffect(() => saveCart(cart), [cart]);
  const lines = cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) })).filter((line): line is CartItem & { product: Product } => Boolean(line.product));
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const add = (product: Product) => setCart((current) => { const found = current.find((item) => item.productId === product.id); if (found) return current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } : item); return [...current, { productId: product.id, quantity: 1 }]; });
  const update = (id: number, quantity: number) => setCart((current) => quantity < 1 ? current.filter((item) => item.productId !== id) : current.map((item) => item.productId === id ? { ...item, quantity: Math.min(products.find((product) => product.id === id)?.stock ?? quantity, quantity) } : item));
  const clear = () => setCart([]);
  return { cart, lines, count, total, add, update, clear };
}

function StoreHeader({ count }: { count: number }) {
  return <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#101828]/95 px-5 py-4 text-white backdrop-blur sm:px-10"><Link to="/" className="text-lg font-bold">حافظ للإلكترونيات الحديثة</Link><nav className="flex items-center gap-4 text-sm"><Link to="/" className="hidden text-slate-300 hover:text-white sm:inline">الرئيسية</Link><Link to="/cart" className="relative rounded-lg bg-white/10 px-3 py-2 text-orange-200"><ShoppingBag className="ml-1 inline" size={17} />السلة{count > 0 && <span className="mr-1 rounded-full bg-orange-500 px-1.5 text-xs text-white">{count}</span>}</Link><Link to="/admin" className="hidden text-orange-300 hover:text-orange-200 sm:inline">دخول المالك</Link></nav></header>;
}

export function Storefront({ products, setProducts: _setProducts }: VisitorProps) {
  const { add, count } = useCart(products);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  return <div dir="rtl" className="min-h-screen bg-slate-50"><StoreHeader count={count} /><main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8"><section className="rounded-3xl bg-[#162237] p-7 text-white sm:p-12"><p className="text-sm text-orange-300">متجر حافظ للإلكترونيات</p><h1 className="mt-3 text-3xl font-bold sm:text-5xl">كل ما تحتاجه من التقنية الحديثة</h1><p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">منتجات أصلية، عروض مميزة، وتجربة شراء سهلة مع توصيل إلى باب منزلك.</p><Link to="#products" className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white">تسوق الآن <ArrowLeft className="mr-2" size={17} /></Link></section><section id="products" className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">منتجاتنا</h2><p className="mt-1 text-sm text-slate-500">اختر منتجاتك وأضفها إلى السلة</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث في المنتجات" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 sm:w-64" /></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((product) => <article key={product.id} className="panel overflow-hidden"><div className="relative">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-52 w-full object-cover" /> : <div className={`flex h-52 items-center justify-center ${product.surface}`}><product.icon size={56} className={product.tint} /></div>}{product.stock < 5 && product.stock > 0 && <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">باقي {product.stock} فقط</span>}</div><div className="space-y-3 p-4"><p className="text-xs text-slate-500">{product.category}</p><h3 className="font-bold">{product.name}</h3><p className="text-sm text-slate-500">{product.spec}</p><div className="flex items-center justify-between"><strong className="text-lg text-orange-600">{money(product.price)}</strong><button disabled={product.stock < 1} onClick={() => add(product)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-300">{product.stock ? 'أضف للسلة' : 'غير متوفر'}</button></div></div></article>)}</div></section><section className="grid gap-4 sm:grid-cols-3"><div className="panel p-5"><Truck className="text-orange-500" /><h3 className="mt-3 font-bold">توصيل موثوق</h3><p className="mt-1 text-sm text-slate-500">نجهز طلبك بعناية حتى يصل إليك.</p></div><div className="panel p-5"><PackageCheck className="text-orange-500" /><h3 className="mt-3 font-bold">منتجات أصلية</h3><p className="mt-1 text-sm text-slate-500">اختيارات تقنية موثوقة ومراجعة قبل الشحن.</p></div><div className="panel p-5"><ShoppingBag className="text-orange-500" /><h3 className="mt-3 font-bold">شراء سهل</h3><p className="mt-1 text-sm text-slate-500">أكمل طلبك في دقائق من أي جهاز.</p></div></section></main></div>;
}

export function CartPage({ products }: VisitorProps) {
  const { lines, count, total, update } = useCart(products);
  const navigate = useNavigate();
  return <div dir="rtl" className="min-h-screen bg-slate-50"><StoreHeader count={count} /><main className="mx-auto max-w-4xl space-y-5 p-4 sm:p-8"><Link to="/" className="inline-flex items-center gap-2 text-sm text-orange-600"><ArrowLeft size={16} />متابعة التسوق</Link><div className="panel p-5 sm:p-7"><h1 className="text-2xl font-bold">سلة التسوق</h1>{lines.length ? <><div className="mt-6 divide-y divide-slate-100">{lines.map((line) => <div key={line.product.id} className="flex flex-wrap items-center gap-4 py-4"><img src={line.product.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" /><div className="min-w-[150px] flex-1"><h2 className="font-bold">{line.product.name}</h2><p className="mt-1 text-sm text-slate-500">{money(line.product.price)}</p></div><div className="flex items-center gap-2 rounded-lg border bg-white p-1"><button onClick={() => update(line.product.id, line.quantity - 1)} className="p-1"><Minus size={15} /></button><span className="min-w-6 text-center">{line.quantity}</span><button onClick={() => update(line.product.id, line.quantity + 1)} className="p-1"><Plus size={15} /></button></div><strong>{money(line.product.price * line.quantity)}</strong><button onClick={() => update(line.product.id, 0)} className="text-rose-500"><Trash2 size={17} /></button></div>)}</div><div className="mt-5 flex items-center justify-between border-t pt-5"><span className="text-slate-500">الإجمالي</span><strong className="text-2xl text-orange-600">{money(total)}</strong></div><button onClick={() => navigate('/checkout')} className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">متابعة إلى الدفع</button></> : <div className="py-16 text-center"><ShoppingBag className="mx-auto text-slate-300" size={46} /><p className="mt-4 text-slate-500">السلة فارغة</p><Link to="/" className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white">تصفح المنتجات</Link></div>}</div></main></div>;
}

export function CheckoutPage({ products, setProducts }: VisitorProps) {
  const { lines, count, total, clear } = useCart(products);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '', paymentMethod: 'cash_on_delivery' as OnlineOrder['paymentMethod'] });
  const [submitting, setSubmitting] = useState(false);
  const shipping = total >= 500 ? 0 : 25;
  const grandTotal = total + shipping;
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lines.length) return navigate('/cart');
    setSubmitting(true);
    const items = lines.map((line) => ({ product_id: line.product.id, quantity: line.quantity }));
    let order: OnlineOrder;
    if (supabase) {
      const { data, error } = await supabase.rpc('create_online_order', {
        p_customer_name: form.name,
        p_customer_phone: form.phone,
        p_city: form.city,
        p_address: form.address,
        p_notes: form.notes,
        p_payment_method: form.paymentMethod,
        p_shipping: shipping,
        p_items: items,
      });
      if (error || !data?.[0]) {
        setSubmitting(false);
        window.alert(error?.message ?? 'تعذر تسجيل الطلب في قاعدة البيانات. حاول مرة أخرى.');
        return;
      }
      const result = data[0] as { order_id: string; order_number: string; total: number };
      order = { id: result.order_number, createdAt: new Date().toISOString(), status: 'new', customer: { name: form.name, phone: form.phone, city: form.city, address: form.address, notes: form.notes }, paymentMethod: form.paymentMethod, items: lines.map((line) => ({ productId: line.product.id, name: line.product.name, price: line.product.price, quantity: line.quantity })), subtotal: total, shipping, total: Number(result.total) };
    } else {
      order = { id: `#WEB-${Date.now()}`, createdAt: new Date().toISOString(), status: 'new', customer: { name: form.name, phone: form.phone, city: form.city, address: form.address, notes: form.notes }, paymentMethod: form.paymentMethod, items: lines.map((line) => ({ productId: line.product.id, name: line.product.name, price: line.product.price, quantity: line.quantity })), subtotal: total, shipping, total: grandTotal };
      setProducts((current) => current.map((product) => { const line = lines.find((item) => item.product.id === product.id); return line ? { ...product, stock: Math.max(0, product.stock - line.quantity) } : product; }));
    }
    const orders = JSON.parse(localStorage.getItem(ordersKey) ?? '[]') as OnlineOrder[];
    localStorage.setItem(ordersKey, JSON.stringify([order, ...orders]));
    clear();
    setSubmitting(false);
    navigate(`/order-success?id=${encodeURIComponent(order.id)}`);
  };
  return <div dir="rtl" className="min-h-screen bg-slate-50"><StoreHeader count={count} /><main className="mx-auto max-w-5xl p-4 sm:p-8"><div className="grid gap-5 lg:grid-cols-[1fr_360px]"><form onSubmit={submit} className="panel space-y-5 p-5 sm:p-7"><div><h1 className="text-2xl font-bold">إتمام الطلب</h1><p className="mt-1 text-sm text-slate-500">أدخل بيانات التوصيل وسنتواصل معك لتأكيد الطلب.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">الاسم الكامل<input required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal" /></label><label className="text-sm font-semibold">رقم الهاتف<input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal" /></label><label className="text-sm font-semibold">المدينة<input required value={form.city} onChange={(e) => update('city', e.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal" /></label><label className="text-sm font-semibold">العنوان بالتفصيل<input required value={form.address} onChange={(e) => update('address', e.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal" placeholder="الحي، الشارع، رقم المبنى" /></label></div><label className="block text-sm font-semibold">ملاحظات الطلب<textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="mt-2 min-h-24 w-full rounded-lg border px-3 py-2 font-normal" placeholder="اختياري" /></label><fieldset><legend className="text-sm font-semibold">طريقة الدفع</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className={`rounded-lg border p-3 text-sm ${form.paymentMethod === 'cash_on_delivery' ? 'border-orange-400 bg-orange-50' : ''}`}><input type="radio" checked={form.paymentMethod === 'cash_on_delivery'} onChange={() => update('paymentMethod', 'cash_on_delivery')} className="ml-2" />الدفع عند الاستلام</label><label className={`rounded-lg border p-3 text-sm ${form.paymentMethod === 'card_on_delivery' ? 'border-orange-400 bg-orange-50' : ''}`}><input type="radio" checked={form.paymentMethod === 'card_on_delivery'} onChange={() => update('paymentMethod', 'card_on_delivery')} className="ml-2" />بطاقة عند الاستلام</label></div></fieldset><button disabled={submitting} className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{submitting ? 'جارٍ إرسال الطلب...' : 'تأكيد الطلب'}</button></form><aside className="panel h-fit p-5"><h2 className="font-bold">ملخص الطلب</h2><div className="mt-4 space-y-3">{lines.map((line) => <div key={line.product.id} className="flex justify-between gap-3 text-sm"><span>{line.product.name} × {line.quantity}</span><span>{money(line.product.price * line.quantity)}</span></div>)}</div><div className="mt-5 space-y-2 border-t pt-4 text-sm"><div className="flex justify-between"><span>المنتجات</span><span>{money(total)}</span></div><div className="flex justify-between"><span>التوصيل</span><span>{shipping ? money(shipping) : 'مجاني'}</span></div><div className="flex justify-between pt-2 text-lg font-bold"><span>الإجمالي</span><span className="text-orange-600">{money(grandTotal)}</span></div></div></aside></div></main></div>;
}

export function OrderSuccessPage() {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get('id') ?? 'طلبك';
  return <div dir="rtl" className="min-h-screen bg-slate-50"><StoreHeader count={0} /><main className="grid min-h-[70vh] place-items-center p-5"><div className="panel max-w-lg p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-500" size={64} /><h1 className="mt-5 text-2xl font-bold">تم استلام طلبك بنجاح</h1><p className="mt-3 leading-7 text-slate-500">رقم الطلب <strong className="text-slate-800">{id}</strong>. سنتواصل معك على رقم الهاتف لتأكيد التفاصيل والتوصيل.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white">العودة للمتجر</Link><Link to="/cart" className="rounded-xl border px-5 py-3 text-sm font-bold">عرض السلة</Link></div></div></main></div>;
}
