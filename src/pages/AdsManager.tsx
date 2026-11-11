import { useState, type FormEvent } from 'react';
import { Image, Pencil, Plus, ToggleLeft, ToggleRight, Trash2, Video, X } from 'lucide-react';
import type { Ad } from '../data/mock';

type AdForm = Omit<Ad, 'id'>;

type AdsManagerProps = {
  ads: Ad[];
  onSave: (ad: Ad) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

const emptyForm = (): AdForm => ({
  type: 'image',
  url: '',
  title: '',
  duration_seconds: 5,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  is_active: true,
});

function isInSchedule(ad: Ad) {
  const today = new Date().toISOString().slice(0, 10);
  return ad.start_date <= today && ad.end_date >= today;
}

export default function AdsManager({
  ads,
  onSave,
  onToggle,
  onDelete,
}: AdsManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEditForm = (ad: Ad) => {
    setEditingId(ad.id);
    setForm({
      type: ad.type,
      url: ad.url,
      title: ad.title,
      duration_seconds: ad.duration_seconds,
      start_date: ad.start_date,
      end_date: ad.end_date,
      is_active: ad.is_active,
    });
    setFormOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.end_date < form.start_date) {
      window.alert('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.');
      return;
    }

    onSave({
      id: editingId ?? `ad-${Date.now()}`,
      ...form,
      duration_seconds: Math.max(1, Number(form.duration_seconds)),
    });
    setFormOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">إدارة الإعلانات</h2>
          <p className="mt-1 text-sm text-slate-500">
            أضف إعلانات الصور أو الفيديو وحدد موعد ظهورها ومدته.
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="ml-1 inline" size={16} />
          إضافة إعلان
        </button>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        هذه نسخة تجريبية: التغييرات محفوظة في حالة التطبيق فقط، وتُفقد عند إعادة تحميل الصفحة.
      </div>

      {formOpen && (
        <form onSubmit={submit} className="panel space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">
              {editingId ? 'تعديل الإعلان' : 'إعلان جديد'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="إغلاق النموذج"
              className="text-slate-500"
            >
              <X size={19} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              عنوان الإعلان
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                placeholder="مثال: عروض الأسبوع"
              />
            </label>

            <label className="text-sm">
              نوع الإعلان
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as Ad['type'],
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3"
              >
                <option value="image">صورة</option>
                <option value="video">فيديو</option>
              </select>
            </label>

            <label className="text-sm sm:col-span-2">
              رابط الصورة أو الفيديو
              <input
                required
                type="url"
                value={form.url}
                onChange={(event) =>
                  setForm((current) => ({ ...current, url: event.target.value }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                placeholder="https://example.com/ad.jpg"
              />
            </label>

            <label className="text-sm">
              مدة العرض (بالثواني)
              <input
                required
                type="number"
                min="1"
                max="300"
                value={form.duration_seconds}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    duration_seconds: Number(event.target.value),
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
              />
            </label>

            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
              />
              تفعيل الإعلان
            </label>

            <label className="text-sm">
              تاريخ البدء
              <input
                required
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    start_date: event.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
              />
            </label>

            <label className="text-sm">
              تاريخ الانتهاء
              <input
                required
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    end_date: event.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
            >
              حفظ الإعلان
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.map((ad) => (
          <article key={ad.id} className="panel overflow-hidden">
            <div className="relative h-44 bg-slate-100">
              {ad.type === 'video' ? (
                <video
                  src={ad.url}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={ad.url}
                  alt={ad.title}
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold">
                {ad.type === 'video' ? (
                  <><Video className="ml-1 inline" size={13} /> فيديو</>
                ) : (
                  <><Image className="ml-1 inline" size={13} /> صورة</>
                )}
              </span>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{ad.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    مدة العرض: {ad.duration_seconds} ثوانٍ
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ${
                    ad.is_active && isInSchedule(ad)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {ad.is_active && isInSchedule(ad) ? 'نشط' : 'متوقف / خارج الموعد'}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                من {ad.start_date} إلى {ad.end_date}
              </p>

              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => onToggle(ad.id)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  {ad.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {ad.is_active ? 'إيقاف' : 'تفعيل'}
                </button>
                <button
                  onClick={() => openEditForm(ad)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  <Pencil size={14} />
                  تعديل
                </button>
                <button
                  onClick={() => onDelete(ad.id)}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs text-rose-600"
                >
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          </article>
        ))}

        {ads.length === 0 && (
          <div className="panel p-10 text-center text-sm text-slate-500">
            لا توجد إعلانات. أضف إعلانك الأول.
          </div>
        )}
      </div>
    </div>
  );
}
