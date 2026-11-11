import { FormEvent, useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OwnerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setError('إعدادات Supabase غير موجودة في هذه النسخة.');
      return;
    }
    setBusy(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setError('بيانات الدخول غير صحيحة أو لم يتم تأكيد البريد الإلكتروني.');
      setBusy(false);
      return;
    }
    navigate(from, { replace: true });
  };

  return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#101828] p-5">
    <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white"><Zap size={27} fill="currentColor" /></div>
      <div className="mt-5 text-center"><h1 className="text-2xl font-bold">دخول المالك</h1><p className="mt-2 text-sm text-slate-500">الوصول إلى لوحة إدارة حافظ للإلكترونيات</p></div>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block text-sm font-semibold">البريد الإلكتروني<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-orange-400" placeholder="owner@example.com" /></label>
        <label className="block text-sm font-semibold">كلمة المرور<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-orange-400" placeholder="••••••••" /></label>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button disabled={busy} className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"><LogIn className="ml-2" size={18} />{busy ? 'جارٍ التحقق...' : 'تسجيل الدخول'}</button>
      </form>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><ShieldCheck size={15} />هذه الصفحة مخصصة للمالك فقط</p>
      <button onClick={() => navigate('/')} className="mt-4 w-full text-sm text-slate-500 hover:text-orange-600">العودة إلى المتجر</button>
    </section>
    <p className="fixed bottom-4 text-xs text-slate-500"><LockKeyhole className="ml-1 inline" size={13} />تسجيل آمن عبر Supabase Auth</p>
  </main>;
}
