import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Undo2 } from 'lucide-react';
import type { Category } from '@/types';
import { useCategories } from '@/hooks/queries';
import { useAdminMutation } from '@/hooks/adminQueries';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n/I18nProvider';
import { categoryService } from '@/services/categoryService';
import { getErrorMessage } from '@/services/api/client';
import { slugify } from '@/data/products';
import { AdminPageHeader } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Disclosure';
import { Badge } from '@/components/ui/Badge';
import { SafeImage } from '@/components/ui/SafeImage';
import { Skeleton } from '@/components/ui/Skeleton';

/** Mock management of sports, categories and subcategories (rename, describe, add/remove subcategories). */
export function AdminCategories() {
  const { t } = useI18n();
  const toast = useToast();
  useSeo({ title: 'Categories', noindex: true });
  const { data, isLoading } = useCategories();
  const [draft, setDraft] = useState<Category[] | null>(null);
  const [newSub, setNewSub] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data && !draft) setDraft(structuredClone(data));
  }, [data, draft]);
  const save = useAdminMutation((list: Category[]) => categoryService.saveAll(list));
  const dirty = JSON.stringify(draft) !== JSON.stringify(data);

  const patch = (slug: string, fn: (c: Category) => Category) => setDraft((d) => d?.map((c) => (c.slug === slug ? fn(c) : c)) ?? null);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.categories}
        description="Sports and categories drive navigation, filters and landing pages."
        actions={
          <>
            <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(data ? structuredClone(data) : null)} leftIcon={<Undo2 className="h-4 w-4" />}>Discard</Button>
            <Button
              disabled={!dirty || !draft}
              loading={save.isPending}
              onClick={() => draft && save.mutate(draft, { onSuccess: (list) => { setDraft(structuredClone(list)); toast.success('Categories saved'); }, onError: (e) => toast.error(getErrorMessage(e)) })}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {t.common.saveChanges}
            </Button>
          </>
        }
      />
      {isLoading || !draft ? (
        <div className="space-y-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="rounded-3xl border border-line bg-surface px-5">
          <Accordion
            items={draft.map((c) => ({
              key: c.slug,
              title: (
                <span className="flex items-center gap-3">
                  <SafeImage src={c.image} alt="" width={96} ratio={1} wrapperClassName="h-9 w-9 rounded-lg" />
                  {c.name}
                </span>
              ),
              badge: <Badge tone={c.isSport ? 'info' : 'neutral'}>{c.isSport ? 'Sport' : 'Category'} · {c.subcategories.length}</Badge>,
              content: (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-fg">
                      Display name
                      <input value={c.name} maxLength={40} onChange={(e) => patch(c.slug, (x) => ({ ...x, name: e.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm font-normal" />
                    </label>
                    <label className="text-sm font-semibold text-fg">
                      Description
                      <input value={c.description} maxLength={200} onChange={(e) => patch(c.slug, (x) => ({ ...x, description: e.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm font-normal" />
                    </label>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {c.subcategories.map((s, i) => (
                      <li key={s.slug + i} className="flex items-center gap-2 rounded-xl border border-line p-2">
                        <SafeImage src={s.image} alt="" width={80} ratio={1} wrapperClassName="h-8 w-8 shrink-0 rounded-lg" />
                        <label className="sr-only" htmlFor={'sub-' + c.slug + i}>Subcategory name</label>
                        <input id={'sub-' + c.slug + i} value={s.name} maxLength={40} onChange={(e) => patch(c.slug, (x) => ({ ...x, subcategories: x.subcategories.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) }))} className="h-8 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm hover:border-line focus:border-brand-500" />
                        <button type="button" onClick={() => patch(c.slug, (x) => ({ ...x, subcategories: x.subcategories.filter((_, j) => j !== i) }))} className="rounded-lg p-1.5 text-fg-subtle hover:bg-danger-50 hover:text-danger-600" aria-label={'Remove ' + s.name}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <form
                    className="flex max-w-md gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = (newSub[c.slug] ?? '').trim();
                      if (name.length < 2) return;
                      patch(c.slug, (x) => ({ ...x, subcategories: [...x.subcategories, { slug: slugify(c.slug + '-' + name), name, category: x.slug, image: x.image }] }));
                      setNewSub((m) => ({ ...m, [c.slug]: '' }));
                    }}
                  >
                    <label className="sr-only" htmlFor={'new-' + c.slug}>New subcategory</label>
                    <input id={'new-' + c.slug} placeholder="New subcategory name" maxLength={40} value={newSub[c.slug] ?? ''} onChange={(e) => setNewSub((m) => ({ ...m, [c.slug]: e.target.value }))} className="h-10 flex-1 rounded-xl border border-line-strong bg-surface px-3 text-sm" />
                    <Button type="submit" variant="outline" leftIcon={<Plus className="h-4 w-4" />}>Add</Button>
                  </form>
                </div>
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}
