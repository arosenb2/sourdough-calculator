import { FLOUR_TYPES } from '../types/recipe';

export default function FlourSelection({ selectedFlours = [], onUpdate }) {
  const handleFlourToggle = (key) => {
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(FLOUR_TYPES).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFlours.some(f => f && typeof f === 'object' && f.type === key)}
              onChange={() => handleFlourToggle(key)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-gray-700 dark:text-gray-300">{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}