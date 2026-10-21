import { FLOUR_GROUPS } from '../types/recipe';

export default function FlourSelection({ selectedFlours = [], onUpdate, lockedTypes = [] }) {
  const handleFlourToggle = (key) => {
    if (lockedTypes.includes(key)) return; // the levain uses it, so it stays
    // Ensure we're working with valid flour objects
    const validFlours = selectedFlours.filter(f => f && typeof f === 'object' && 'type' in f);

    if (validFlours.some(f => f.type === key)) {
      const newFlours = validFlours.filter(f => f.type !== key);
      if (newFlours.length === 1) {
        newFlours[0].percentage = 100;
      }
      onUpdate(newFlours);
    } else {
      const newFlours = [...validFlours, { type: key, percentage: 0 }];
      if (newFlours.length === 1) {
        newFlours[0].percentage = 100;
      }
      onUpdate(newFlours);
    }
  };

  return (
    <div className="space-y-6">
      {FLOUR_GROUPS.map((group) => (
        <fieldset key={group.id}>
          <legend className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {group.label}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(group.flours).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFlours.some(f => f && typeof f === 'object' && f.type === key)}
                  onChange={() => handleFlourToggle(key)}
                  disabled={lockedTypes.includes(key)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {value}
                  {lockedTypes.includes(key) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400"> (in levain)</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
