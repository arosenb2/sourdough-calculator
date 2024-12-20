export default function FlourPercentages({ flours, onUpdate }) {
  const updatePercentage = (index, value) => {
    const percentage = Math.min(100, Math.max(0, Number(value) || 0));
    const newFlours = [...flours];
    newFlours[index] = { ...newFlours[index], percentage };
    onUpdate(newFlours);
  };

  const totalPercentage = flours.reduce((sum, f) => sum + (Number(f.percentage) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Adjust percentages (total: {totalPercentage}%)
      </div>
      {flours.map((flour, index) => (
        <div key={index} className="flex items-center gap-4">
          <span className="flex-1 text-gray-700 dark:text-gray-300">{flour.type}</span>
          <input
            type="number"
            value={flour.percentage}
            onChange={(e) => updatePercentage(index, e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     dark:bg-gray-700 dark:text-white"
            min="0"
            max="100"
          />
          <span className="text-gray-600 dark:text-gray-400">%</span>
        </div>
      ))}
      {totalPercentage !== 100 && (
        <div className="text-sm text-red-600 dark:text-red-400">
          Total percentage must equal 100%
        </div>
      )}
    </div>
  );
}