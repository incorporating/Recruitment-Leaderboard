import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { GBP } from '../../lib/constants';
import { Button, Input, Card } from '../ui';

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function RevenueForm({
  userId,
  onAdded,
}: {
  userId: string;
  onAdded: () => void;
}) {
  const { show } = useToast();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      show('Enter a revenue amount greater than zero.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('revenue_entries').insert({
      user_id: userId,
      amount: value,
      invoice_date: date,
      description: description.trim() || null,
    });
    setSaving(false);

    if (error) {
      show('Could not add revenue. Try again.');
      return;
    }
    show(`Revenue added: ${GBP.format(value)}`);
    setAmount('');
    setDescription('');
    setDate(todayIso());
    onAdded();
  }

  return (
    <Card>
      <h3 className="mb-3 font-display text-lg font-semibold text-white">Add revenue</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="rev-amount" className="mb-1.5 block text-sm text-slate-300">
            Amount (GBP)
          </label>
          <Input
            id="rev-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="rev-date" className="mb-1.5 block text-sm text-slate-300">
            Invoice date
          </label>
          <Input
            id="rev-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="rev-desc" className="mb-1.5 block text-sm text-slate-300">
            Description <span className="text-slate-500">(optional)</span>
          </label>
          <Input
            id="rev-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. placement - Acme Corp"
          />
        </div>
        <Button onClick={submit} disabled={saving} className="w-full">
          {saving ? 'Adding\u2026' : 'Add revenue entry'}
        </Button>
      </div>
    </Card>
  );
}
