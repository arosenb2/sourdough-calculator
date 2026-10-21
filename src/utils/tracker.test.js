import { describe, it, expect } from 'vitest';
import { buildEntry, formatElapsed, sortEntries } from './tracker';

describe('buildEntry', () => {
  it('builds an entry from form strings', () => {
    const { entry } = buildEntry({ recordedAt: '2026-10-20T08:30', rise: '25', temp: '78.5', notes: ' bubbly ' });
    expect(entry).toMatchObject({ rise: 25, temp: 78.5, notes: 'bubbly' });
  });

  it('rejects an empty data point', () => {
    expect(buildEntry({ recordedAt: '2026-10-20T08:30', rise: '', temp: '', notes: '' }).error).toBeTruthy();
  });

  it('rejects a bad time or a negative rise', () => {
    expect(buildEntry({ recordedAt: '', rise: '5' }).error).toBeTruthy();
    expect(buildEntry({ recordedAt: '2026-10-20T08:30', rise: '-5' }).error).toBeTruthy();
  });

  it('allows a notes-only entry', () => {
    expect(buildEntry({ recordedAt: '2026-10-20T08:30', notes: 'folded' }).entry.rise).toBeNull();
  });
});

describe('formatElapsed / sortEntries', () => {
  it('formats elapsed time', () => {
    expect(formatElapsed('2026-10-20T08:00:00Z', '2026-10-20T11:05:00Z')).toBe('3h 05m');
  });

  it('sorts entries by time', () => {
    const sorted = sortEntries([{ recordedAt: '2026-10-20T10:00:00Z' }, { recordedAt: '2026-10-20T08:00:00Z' }]);
    expect(sorted[0].recordedAt).toBe('2026-10-20T08:00:00Z');
  });
});
