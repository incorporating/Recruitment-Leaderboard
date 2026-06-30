import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useConsultants } from '../hooks/useConsultants';
import { useToast } from '../hooks/useToast';
import { createConsultant, setConsultantPassword } from '../lib/adminApi';
import { Button, Input, Card, Spinner } from '../components/ui';
import type { Profile } from '../types';

function CreateConsultantForm({ onCreated }: { onCreated: () => void }) {
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      show('Enter a name, email, and a password of at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      await createConsultant({ fullName: fullName.trim(), email: email.trim(), password });
      show(`${fullName.trim()} added.`);
      setFullName('');
      setEmail('');
      setPassword('');
      setOpen(false);
      onCreated();
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not create consultant.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>+ Add consultant</Button>
    );
  }

  return (
    <Card className="mb-4">
      <h3 className="mb-3 font-display text-lg font-semibold text-white">New consultant</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm text-slate-300">Full name</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slate-300">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@newmanstewart.co.uk"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slate-300">Initial password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="at least 6 characters"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Their email must match their Bullhorn login exactly, so synced activity maps to them.
      </p>
      <div className="mt-3 flex gap-2">
        <Button onClick={submit} disabled={saving}>
          {saving ? 'Creating\u2026' : 'Create consultant'}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function ConsultantRow({ c, onChanged }: { c: Profile; onChanged: () => void }) {
  const { show } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(c.full_name);
  const [busy, setBusy] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState('');

  async function saveName() {
    setBusy(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('id', c.id);
    setBusy(false);
    if (error) {
      show('Could not update name.');
      return;
    }
    show('Name updated.');
    setEditing(false);
    onChanged();
  }

  async function toggleActive() {
    setBusy(true);
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !c.is_active })
      .eq('id', c.id);
    setBusy(false);
    if (error) {
      show('Could not update status.');
      return;
    }
    show(c.is_active ? `${c.full_name} deactivated.` : `${c.full_name} reactivated.`);
    onChanged();
  }

  async function savePassword() {
    if (newPw.length < 6) {
      show('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await setConsultantPassword({ userId: c.id, password: newPw });
      show('Password updated.');
      setNewPw('');
      setPwOpen(false);
    } catch (e) {
      show(e instanceof Error ? e.message : 'Could not set password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-navy-700 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
              <Button onClick={saveName} disabled={busy}>Save</Button>
              <Button variant="ghost" onClick={() => { setEditing(false); setName(c.full_name); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{c.full_name}</span>
              {!c.is_active && (
                <span className="rounded bg-navy-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                  Inactive
                </span>
              )}
            </div>
          )}
          <p className="truncate text-sm text-slate-500">{c.email}</p>
        </div>
        {!editing && (
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="ghost" onClick={() => setPwOpen((o) => !o)}>Password</Button>
            <Button variant={c.is_active ? 'danger' : 'primary'} onClick={toggleActive} disabled={busy}>
              {c.is_active ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        )}
      </div>
      {pwOpen && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-navy-900 p-3">
          <Input
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="New password (min 6 chars)"
            className="max-w-xs"
          />
          <Button onClick={savePassword} disabled={busy}>Set password</Button>
          <Button variant="ghost" onClick={() => { setPwOpen(false); setNewPw(''); }}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const { consultants, loading, error, refetch } = useConsultants();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Consultants</h1>
      </div>

      <div className="mb-4">
        <CreateConsultantForm onCreated={refetch} />
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : consultants.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No consultants yet. Add your first one above.
          </p>
        ) : (
          <div>
            {consultants.map((c) => (
              <ConsultantRow key={c.id} c={c} onChanged={refetch} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
