import { useEffect } from 'react';
import FlourSelection from './FlourSelection';
import FlourPercentages from './FlourPercentages';
import { FLOUR_TYPES } from '../types/recipe';

export default function FlourDistribution({ flours, onUpdate }) {
  useEffect(() => {
    if (!flours.length || !flours[0].type) {
      onUpdate([{ type: FLOUR_TYPES.BF, percentage: 100 }]);
    }
  }, [flours, onUpdate]);

  return (
    <div className="space-y-6">
      <FlourSelection
        selectedFlours={flours} // Remove filter since validation happens in useEffect
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