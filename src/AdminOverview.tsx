import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConsultants } from '../hooks/useConsultants';
import { useToast } from '../hooks/useToast';
import { ACTIVITY_META, GBP } from '../lib/constants';
import { Button, Input, Card } from '../components/ui';
import type { ActivityType } from '../types';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

const ACTIVITY_TYPES: ActivityType[] = ['sendout', 'client_meeting', 'candidate_call'];

interface LogLine {
  id: number;
  text: string;
}

export default function AdminBackfill() {
  const { consultants, loading } = useConsultants();
  const { show } = useToast();

  const [userId, setUserId] = useState('');
  const [entryType, setEntryType] = useState<'activity' | 'revenue'>('activity');

  // activity fields
  const [activityType, setActivityType] = useState<ActivityType>('sendout');
  const [activityDate, setActivityDate] = useState(todayIso());
  const [notes, setNotes] = useState('');

  // revenue fields
  const [amount, setAmount] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(todayIso());
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  let nextLine = 0;

  function addLogLine(text: string) {
    setLog((l) => [{ id: Date.now() + nextLine++, text }, ...l].slice(0, 12));
  }

  async function submit() {
    if (!userId) {
      show('Choose a consultant first.');
      return;
    }
    const who = consultants.find((c) => c.id === userId)?.full_name ?? 'consultant';
    setSaving(true);

    if (entryType === 'activity') {
      const { error } = await supabase.from('activities').insert({
        user_id: userId,
        type: activityType,
        activity_date: activityDate,
        source: 'manual',
        notes: notes.trim() || null,
      });
      setSaving(false);
      if (error) {
        show('Could not add activity.');
        return;
      }
      const meta = ACTIVITY_META[activityType];
      show('Activity added.');
      addLogLine(`${meta.label} for ${who} on ${activityDate}`);
      setNotes('');
    } else {
      const value = parseFloat(amount);
      if (!Number.isFinite(value) || value <= 0) {
        setSaving(false);
        show('Enter a revenue amount greater than zero.');
        return;
      }
      const { error } = await supabase.from('revenue_entries').insert({
        user_id: userId,
        amount: value,
        invoice_date: invoiceDate,
        description: description.trim() || null,
      });
      setSaving(false);
      if (error) {
        show('Could not add revenue.');
        return;
      }
      show('Revenue added.');
      addLogLine(`${GBP.format(value)} for ${who} on ${invoiceDate}`);
      setAmount('');
      setDescription('');
    }
  }

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-white">Add entry</h1>
      <p className="mb-4 text-sm text-slate-400">
        Add a past or present activity or revenue entry for any consultant. Use this to
        correct or fill gaps in synced data.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Consultant</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-lg border border-navy-600 bg-navy-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="">{loading ? 'Loading\u2026' : 'Select a consultant'}</option>
                {consultants.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                    {c.is_active ? '' : ' (inactive)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-1.5 block text-sm text-slate-300">Entry type</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEntryType('activity')}
                  className={
                    'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ' +
                    (entryType === 'activity'
                      ? 'border-brand-blue bg-brand-blue/15 text-white'
                      : 'border-navy-600 text-slate-300 hover:bg-navy-700')
                  }
                >
                  Activity
                </button>
                <button
                  onClick={() => setEntryType('revenue')}
                  className={
                    'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ' +
                    (entryType === 'revenue'
                      ? 'border-brand-blue bg-brand-blue/15 text-white'
                      : 'border-navy-600 text-slate-300 hover:bg-navy-700')
                  }
                >
                  Revenue
                </button>
              </div>
            </div>

            {entryType === 'activity' ? (
              <>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">Activity type</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as ActivityType)}
                    className="w-full rounded-lg border border-navy-600 bg-navy-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-light"
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ACTIVITY_META[t].label} ({ACTIVITY_META[t].points} pts)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">Date</label>
                  <Input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Notes <span className="text-slate-500">(optional)</span>
                  </label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">Amount (GBP)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">Invoice date</label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-300">
                    Description <span className="text-slate-500">(optional)</span>
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button onClick={submit} disabled={saving} className="w-full">
              {saving ? 'Adding\u2026' : 'Add entry'}
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Added this session</h3>
          {log.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Entries you add will be listed here.
            </p>
          ) : (
            <ul className="space-y-2">
              {log.map((l) => (
                <li key={l.id} className="rounded-lg bg-navy-900 px-3 py-2 text-sm text-slate-300">
                  {l.text}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
