import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConsultants } from '../hooks/useConsultants';
import { useToast } from '../hooks/useToast';
import { ACTIVITY_META } from '../lib/constants';
import { Button, Card, Spinner } from '../components/ui';
import type { Activity, ActivityType } from '../types';

interface ActivityWithName extends Activity {
  full_name: string;
}

const PAGE_SIZE = 25;

export default function AdminActivities() {
  const { consultants } = useConsultants();
  const { show } = useToast();
  const nameById = useMemo(
    () => Object.fromEntries(consultants.map((c) => [c.id, c.full_name])),
    [consultants]
  );

  const [rows, setRows] = useState<ActivityWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // filters
  const [filterUser, setFilterUser] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .order('activity_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (filterUser) q = q.eq('user_id', filterUser);
    if (filterType) q = q.eq('type', filterType);
    if (filterSource) q = q.eq('source', filterSource);

    const { data, error, count } = await q;
    setLoading(false);
    if (error) {
      show('Could not load activities.');
      return;
    }
    setTotal(count ?? 0);
    setRows(
      (data ?? []).map((a) => ({
        ...(a as Activity),
        full_name: nameById[(a as Activity).user_id] ?? 'Unknown',
      }))
    );
  }, [page, filterUser, filterType, filterSource, nameById, show]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  async function remove(id: string) {
    if (!confirm('Delete this activity? This cannot be undone.')) return;
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) {
      show('Could not delete.');
      return;
    }
    show('Activity deleted.');
    fetchRows();
  }

  async function changeType(id: string, type: ActivityType) {
    const { error } = await supabase.from('activities').update({ type }).eq('id', id);
    if (error) {
      show('Could not update.');
      return;
    }
    show('Activity updated.');
    fetchRows();
  }

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-white">Activities</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filterUser}
          onChange={(e) => { setFilterUser(e.target.value); setPage(0); }}
          className="rounded-lg border border-navy-600 bg-navy-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All consultants</option>
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
          className="rounded-lg border border-navy-600 bg-navy-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All types</option>
          {(['sendout', 'client_meeting', 'candidate_call'] as ActivityType[]).map((t) => (
            <option key={t} value={t}>{ACTIVITY_META[t].label}</option>
          ))}
        </select>
        <select
          value={filterSource}
          onChange={(e) => { setFilterSource(e.target.value); setPage(0); }}
          className="rounded-lg border border-navy-600 bg-navy-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All sources</option>
          <option value="manual">Manual</option>
          <option value="bullhorn">Bullhorn</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No activities match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Consultant</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Source</th>
                  <th className="pb-2 pr-4 font-medium">Notes</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-t border-navy-700">
                    <td className="tnum py-2 pr-4 text-slate-300">{a.activity_date}</td>
                    <td className="py-2 pr-4 text-white">{a.full_name}</td>
                    <td className="py-2 pr-4">
                      {a.source === 'manual' ? (
                        <select
                          value={a.type}
                          onChange={(e) => changeType(a.id, e.target.value as ActivityType)}
                          className="rounded border border-navy-600 bg-navy-900 px-2 py-1 text-slate-200"
                        >
                          {(['sendout', 'client_meeting', 'candidate_call'] as ActivityType[]).map((t) => (
                            <option key={t} value={t}>{ACTIVITY_META[t].label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-300">{ACTIVITY_META[a.type].label}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={a.source === 'bullhorn' ? 'text-brand-light' : 'text-slate-400'}>
                        {a.source}
                      </span>
                    </td>
                    <td className="max-w-xs truncate py-2 pr-4 text-slate-400">{a.notes}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => remove(a.id)}
                        className="rounded px-2 py-1 text-slate-500 hover:bg-red-600/15 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>{total} total</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                Previous
              </Button>
              <span className="px-2 py-2">Page {page + 1} of {maxPage + 1}</span>
              <Button variant="ghost" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page >= maxPage}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
