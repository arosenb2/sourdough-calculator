import { useEffect } from 'react';
import FlourSelection from './FlourSelection';
import FlourPercentages from './FlourPercentages';
import { withLevainFlours } from '../utils/recipeDefaults';
import { blendProblem } from '../utils/validations';

/**
 * Flours are entered as a percent of ALL the flour. `levainFlour` (optional) is what the
 * levain already holds, { total, byType } as % of all flour: those flours stay selected and
 * can't go below that share.
 */
export default function FlourDistribution({ flours, onUpdate, levainFlour }) {
  const byType = levainFlour?.byType || {};
  const lockedTypes = Object.keys(byType).filter((type) => byType[type] > 0);
  const missing = lockedTypes.filter((type) => !flours.some((f) => f.type === type));

  useEffect(() => {
    if (!flours.length || !flours[0].type) {
      onUpdate([{ type: 'BF', percentage: 100 }]);
    } else if (missing.length) {
      onUpdate(withLevainFlours(flours, byType));
    }
  }, [flours, onUpdate, missing.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const problem = flours.length > 1 ? blendProblem(flours, byType) : null;

  return (
    <div className="space-y-6">
      <FlourSelection selectedFlours={flours} onUpdate={onUpdate} lockedTypes={lockedTypes} />
      {flours.length > 1 && <FlourPercentages flours={flours} onUpdate={onUpdate} levainByType={byType} />}
      {problem && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {problem}
        </p>
      )}
    </div>
  );
}
