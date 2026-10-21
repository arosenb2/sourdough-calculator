/** Value for a datetime-local input, in the user's local time. */
export const toLocalInputValue = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

/** Hours and minutes between two timestamps, e.g. "3h 05m". */
export const formatElapsed = (fromIso, toIso) => {
  const minutes = Math.round((new Date(toIso) - new Date(fromIso)) / 60000);
  if (!Number.isFinite(minutes)) return '';
  const sign = minutes < 0 ? '-' : '';
  const abs = Math.abs(minutes);
  return `${sign}${Math.floor(abs / 60)}h ${String(abs % 60).padStart(2, '0')}m`;
};

export const sortEntries = (entries) =>
  [...entries].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

const optionalNumber = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
};

/** Returns the entry to store, or an error message. */
export const buildEntry = ({ recordedAt, rise, temp, notes }) => {
  const time = new Date(recordedAt);
  if (!recordedAt || Number.isNaN(time.getTime())) return { error: 'Enter a valid time.' };

  const entry = {
    recordedAt: time.toISOString(),
    rise: optionalNumber(rise),
    temp: optionalNumber(temp),
    notes: String(notes || '').trim().slice(0, 1000),
  };

  if (entry.rise !== null && entry.rise < 0) return { error: 'Rise cannot be negative.' };
  if (entry.rise === null && entry.temp === null && !entry.notes) {
    return { error: 'Add a rise, a temperature, or a note.' };
  }
  return { entry };
};
