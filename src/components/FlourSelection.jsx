import { FLOUR_TYPES } from '../types/recipe';

export default function FlourSelection({ selectedFlours, onUpdate }) {
  const handleFlourToggle = (flourType) => {
    if (selectedFlours.some(f => f.type === flourType)) {
      onUpdate(selectedFlours.filter(f => f.type !== flourType));
    } else {
      const newFlours = [...selectedFlours, { type: flourType, percentage: 0 }];
      // If only one flour, set to 100%
      if (newFlours.length === 1) {
        newFlours[0].percentage = 100;
      }
      onUpdate(newFlours);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(FLOUR_TYPES).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFlours.some(f => f.type === value)}
              onChange={() => handleFlourToggle(value)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}