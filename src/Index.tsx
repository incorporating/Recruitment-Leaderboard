import { Card } from '../components/ui';

// Full Bullhorn controls (credentials, manual sync, sync log, unmatched
// records) are built in Phase 5, once the API credentials and the entity/field
// mapping from the Bullhorn export are available.
export default function AdminBullhorn() {
  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-white">Bullhorn</h1>
      <Card>
        <p className="text-sm text-slate-400">
          Bullhorn sync is set up in a later phase. Once your API credentials and the
          export showing how Sendouts, Meetings, Calls and Revenue are stored are ready,
          this is where you'll manage credentials, trigger a manual sync, and view the
          sync log.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Until then, activity and revenue can be added manually under "Add entry".
        </p>
      </Card>
    </div>
  );
}
