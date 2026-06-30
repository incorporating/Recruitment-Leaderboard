import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ACTIVITY_META } from '../../lib/constants';
import { useToast } from '../../hooks/useToast';
import { Button, Input } from '../ui';
import type { ActivityType } from '../../types';

const ORDER: ActivityType[] = ['sendout', 'client_meeting', 'candidate_call'];

export function QuickLogPanel({
  userId,
  onLogged,
}: {
  userId: string;
  onLogged: () => void;
}) {
  const { show } = useToast();
  const [active, setActive] = useState<ActivityType | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function pick(type: ActivityType) {
    setActive((cur) => (cur === type ? null : type));
    setNotes('');
  }

  async function confirm() {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase.from('activities').insert({
      user_id: userId,
      type: active,
      source: 'manual',
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      show(`Could not log ${ACTIVITY_META[active].label.toLowerCase()}. Try again.`);
      return;
    }

    const meta = ACTIVITY_META[active];
    show(`${meta.label} logged. +${meta.points} pts`);
    setActive(null);
    setNotes('');
    onLogged();
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ORDER.map((type) => {
          const meta = ACTIVITY_META[type];
          const isActive = active === type;
          return (
            <button
              key={type}
              onClick={() => pick(type)}
              aria-pressed={isActive}
              className={
                'flex flex-col items-center gap-1 rounded-xl border p-4 transition-all ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ' +
                (isActive
                  ? 'border-brand-blue bg-brand-blue/15 ring-1 ring-brand-blue'
                  : 'border-navy-700 bg-navy-800 hover:border-navy-600 hover:bg-navy-700')
              }
            >
              <span className="text-2xl" aria-hidden>
                {meta.emoji}
              </span>
              <span className="font-semibold text-white">{meta.label}</span>
              <span className="text-sm text-brand-light">{meta.points} pts</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-4 rounded-xl border border-navy-700 bg-navy-800 p-4">
          <label htmlFor="notes" className="mb-1.5 block text-sm text-slate-300">
            Add a note for this {ACTIVITY_META[active].label.toLowerCase()}{' '}
            <span className="text-slate-500">(optional)</span>
          </label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. client name, role, candidate"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirm();
              if (e.key === 'Escape') setActive(null);
            }}
          />
          <div className="mt-3 flex gap-2">
            <Button onClick={confirm} disabled={saving}>
              {saving ? 'Logging\u2026' : `Log ${ACTIVITY_META[active].label}`}
            </Button>
            <Button variant="ghost" onClick={() => setActive(null)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
