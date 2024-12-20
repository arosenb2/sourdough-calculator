import FlourSelection from './FlourSelection';
import FlourPercentages from './FlourPercentages';

export default function FlourDistribution({ flours, onUpdate }) {
  return (
    <div className="space-y-6">
      <FlourSelection
        selectedFlours={flours}
        onUpdate={onUpdate}
      />
      {flours.length > 1 && (
        <FlourPercentages
          flours={flours}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}