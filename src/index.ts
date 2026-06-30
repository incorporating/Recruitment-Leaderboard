import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConsultants } from '../hooks/useConsultants';
import { useToast } from '../hooks/useToast';
import { GBP } from '../lib/constants';
import { Button, Card, Input, Spinner } from '../components/ui';
import type { RevenueEntry } from '../types';

interface RevenueWithName extends RevenueEntry {
  full_name: string;
}

const PAGE_SIZE = 25;

export default function AdminRevenue() {
  const { consultants } = useConsultants();
  const { show } = useToast();
  const nameById = useMemo(
    () => Object.fromEntries(consultants.map((c) => [c.id, c.full_name])),
    [consultants]
  );

  const [rows, setRows] = useState<RevenueWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filterUser, setFilterUser] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('revenue_entries')
      .select('*', { count: 'exact' })
      .order('invoice_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (filterUser) q = q.eq('user_id', filterUser);

    const { data, error, count } = await q;
    setLoading(false);
    if (error) {
      show('Could not load revenue.');
      return;
    }
    setTotal(count ?? 0);
    setRows(
      (data ?? []).map((r) => ({
        ...(r as RevenueEntry),
        full_name: nameById[(r as RevenueEntry).user_id] ?? 'Unknown',
      }))
    );
  }, [page, filterUser, nameById, show]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  async function remove(id: string) {
    if (!confirm('Delete this revenue entry? This cannot be undone.')) return;
    const { error } = await supabase.from('revenue_entries').delete().eq('id', id);
    if (error) {
      show('Could not delete.');
      return;
    }
    show('Revenue deleted.');
    fetchRows();
  }

  async function saveAmount(id: string) {
    const value = parseFloat(editAmount);
    if (!Number.isFinite(value) || value <= 0) {
      show('Enter an amount greater than zero.');
      return;
    }
    const { error } = await supabase.from('revenue_entries').update({ amount: value }).eq('id', id);
    if (error) {
      show('Could not update.');
      return;
    }
    show('Amount updated.');
    setEditId(null);
    fetchRows();
  }

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-white">Revenue</h1>

      <div className="mb-4">
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
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No revenue entries match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Invoice date</th>
                  <th className="pb-2 pr-4 font-medium">Consultant</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 pr-4 font-medium">Description</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-navy-700">
                    <td className="tnum py-2 pr-4 text-slate-300">{r.invoice_date}</td>
                    <td className="py-2 pr-4 text-white">{r.full_name}</td>
                    <td className="py-2 pr-4">
                      {editId === r.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-28"
                          />
                          <Button onClick={() => saveAmount(r.id)}>Save</Button>
                          <Button variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <button
                          className="tnum text-brand-light hover:underline"
                          onClick={() => { setEditId(r.id); setEditAmount(String(r.amount)); }}
                        >
                          {GBP.format(Number(r.amount))}
                        </button>
                      )}
                    </td>
                    <td className="max-w-xs truncate py-2 pr-4 text-slate-400">{r.description}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => remove(r.id)}
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
