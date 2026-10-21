export const inputClass =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white';

export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {children}
    </label>
  );
}

export function Toggle({ label, checked, onChange, hint, disabled = false }) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
      />
      <span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{label}</span>
        {hint && <span className="block text-sm text-gray-500 dark:text-gray-400">{hint}</span>}
      </span>
    </label>
  );
}

export function OptionCard({ selected, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left w-full p-4 rounded-lg border-2 transition-colors ${
        selected
          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
          : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
      }`}
    >
      <span className="block font-semibold text-gray-900 dark:text-white">{title}</span>
      {description && (
        <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</span>
      )}
    </button>
  );
}
