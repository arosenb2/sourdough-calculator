import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import useTrackerStore from '../stores/trackerStore';
import PrintableRecipe from './PrintableRecipe';
import RiseChart from './RiseChart';
import { recipeLabel } from './DoughTracker';
import { Label, inputClass } from './steps/fields';
import { buildEntry, formatElapsed, sortEntries, toLocalInputValue } from '../utils/tracker';

function EntryForm({ onAdd }) {
  const [recordedAt, setRecordedAt] = useState(() => toLocalInputValue());
  const [rise, setRise] = useState('');
  const [temp, setTemp] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const { entry, error: problem } = buildEntry({ recordedAt, rise, temp, notes });
    if (problem) {
      setError(problem);
      return;
    }
    onAdd(entry);
    setRise('');
    setTemp('');
    setNotes('');
    setError('');
    setRecordedAt(toLocalInputValue());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="entry-time">Time</Label>
          <input id="entry-time" type="datetime-local" className={inputClass} value={recordedAt} onChange={(e) => setRecordedAt(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="entry-rise">Aliquot rise (%)</Label>
          <input id="entry-rise" type="number" min="0" step="any" className={inputClass} value={rise} onChange={(e) => setRise(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="entry-temp">Dough temp (°F)</Label>
          <input id="entry-temp" type="number" step="any" className={inputClass} value={temp} onChange={(e) => setTemp(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="entry-notes">Notes</Label>
        <textarea id="entry-notes" rows={2} maxLength={1000} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
        Add data point
      </button>
    </form>
  );
}

export default function BakeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bake = useTrackerStore((state) => state.bakes.find((b) => b.id === id));
  const addEntry = useTrackerStore((state) => state.addEntry);
  const deleteEntry = useTrackerStore((state) => state.deleteEntry);
  const deleteBake = useTrackerStore((state) => state.deleteBake);

  if (!bake) return <Navigate to="/tracker" replace />;

  const entries = sortEntries(bake.entries);
  const chartPoints = entries
    .filter((e) => e.rise !== null)
    .map((e) => ({
      hours: (new Date(e.recordedAt) - new Date(bake.startedAt)) / 3600000,
      rise: e.rise,
    }))
    .filter((p) => p.hours >= 0);

  const handleDeleteBake = () => {
    if (confirm('Delete this bake and all its data points?')) {
      deleteBake(bake.id);
      navigate('/tracker');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <Link to="/tracker" className="text-sm text-indigo-600 dark:text-indigo-400">← All bakes</Link>
        <h2 className="text-2xl font-bold dark:text-white mt-2">{bake.name}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {recipeLabel(bake.recipe)} · started {new Date(bake.startedAt).toLocaleString()}
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400 text-sm">Show recipe</summary>
          <div className="mt-4">
            <PrintableRecipe recipe={bake.recipe} hideActions />
          </div>
        </details>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Add data point</h3>
        <EntryForm onAdd={(entry) => addEntry(bake.id, entry)} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Data points</h3>
        <RiseChart points={chartPoints} />
        {entries.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-4">
            {entries.map((entry) => (
              <li key={entry.id} className="py-3 flex justify-between gap-4">
                <div className="text-gray-800 dark:text-gray-200">
                  <p className="font-medium">
                    {new Date(entry.recordedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      +{formatElapsed(bake.startedAt, entry.recordedAt)}
                    </span>
                  </p>
                  <p className="text-sm">
                    {[entry.rise !== null && `${entry.rise}% rise`, entry.temp !== null && `${entry.temp}°F`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {entry.notes && <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{entry.notes}</p>}
                </div>
                <button
                  onClick={() => deleteEntry(bake.id, entry.id)}
                  aria-label="Delete data point"
                  className="self-start p-1 text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={handleDeleteBake} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800">
          Delete bake
        </button>
      </div>
    </div>
  );
}
