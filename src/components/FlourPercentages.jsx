import { FLOUR_TYPES } from '../types/recipe';

/**
 * `levainByType` (optional) is the share of all flour the levain already holds per flour,
 * which is the least each of those flours can be.
 */
export default function FlourPercentages({ flours, onUpdate, levainByType = {} }) {
  const minimumFor = (type) => Math.ceil((levainByType[type] || 0) * 10) / 10;

  const updatePercentage = (index, value) => {
    const percentage = Math.min(100, Math.max(0, Number(value) || 0));
    const newFlours = [...flours];
    newFlours[index] = { ...newFlours[index], percentage };
    onUpdate(newFlours);
  };

  // Raise a value that is under its minimum once the user leaves the field, so typing isn't interrupted
  const enforceMinimum = (index) => {
    const min = minimumFor(flours[index].type);
    if ((Number(flours[index].percentage) || 0) < min) updatePercentage(index, min);
  };

  const totalPercentage = Math.round(flours.reduce((sum, f) => sum + (Number(f.percentage) || 0), 0) * 10) / 10;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Percent of all the flour, levain's included (total: {totalPercentage}%)
      </div>
      {flours.map((flour, index) => (
        <div key={index} className="flex items-center gap-4">
          <span className="flex-1 text-gray-700 dark:text-gray-300">
            {FLOUR_TYPES[flour.type]}
            {minimumFor(flour.type) > 0 && (
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                At least {minimumFor(flour.type)}%: the levain holds that much
              </span>
            )}
          </span>
          <input
            type="number"
            value={flour.percentage}
            onChange={(e) => updatePercentage(index, e.target.value)}
            onBlur={() => enforceMinimum(index)}
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     dark:bg-gray-700 dark:text-white"
            min={minimumFor(flour.type)}
            max="100"
            step="any"
          />
          <span className="text-gray-600 dark:text-gray-400">%</span>
        </div>
      ))}
    </div>
  );
}
