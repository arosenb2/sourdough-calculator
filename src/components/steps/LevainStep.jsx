import FlourDistribution from '../FlourDistribution';
import { Label, inputClass } from './fields';
import { formatPercentage } from '../../utils/formatting';
import { levainComposition } from '../../utils/calculations';

const RATIO_PRESETS = [
  { seed: 1, flour: 5, water: 5 },
  { seed: 1, flour: 10, water: 10 },
  { seed: 2, flour: 10, water: 5, note: 'stiff' },
  { seed: 1, flour: 5, water: 25, note: 'liquid' },
];

const sameRatio = (a, b) =>
  ['seed', 'flour', 'water'].every((key) => parseFloat(a[key]) === b[key]);

export default function LevainStep({ data, onChange }) {
  const { levain } = data;
  const update = (patch) => onChange({ levain: { ...levain, ...patch } });
  const composition = levainComposition(levain);
  const round1 = (n) => formatPercentage(Math.round(n * 10) / 10);
  const levainWeightPercentage = parseFloat(levain.percentage) / (composition.flourPercentage / 100);
  const updateRatio = (key, value) => update({ ratio: { ...levain.ratio, [key]: value } });

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="levain-pct">Prefermented flour, % of total flour</Label>
        <input
          id="levain-pct"
          type="number"
          min="1"
          max="100"
          className={inputClass}
          value={levain.percentage}
          onChange={(e) => update({ percentage: e.target.value })}
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Feeding ratio (starter : flour : water)
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {RATIO_PRESETS.map((preset) => {
            const selected = sameRatio(levain.ratio, preset);
            return (
              <button
                key={`${preset.seed}:${preset.flour}:${preset.water}`}
                type="button"
                aria-pressed={selected}
                onClick={() => update({ ratio: { seed: preset.seed, flour: preset.flour, water: preset.water } })}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                }`}
              >
                {preset.seed}:{preset.flour}:{preset.water}
                {preset.note && <span className="text-xs text-gray-500 dark:text-gray-400"> ({preset.note})</span>}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {['seed', 'flour', 'water'].map((key, i) => (
            <div key={key} className="flex items-center gap-2 flex-1">
              {i > 0 && <span className="text-gray-500">:</span>}
              <input
                aria-label={`Ratio ${key}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={inputClass}
                value={levain.ratio[key]}
                // whole numbers only: drop anything that isn't a digit as it's typed
                onChange={(e) => updateRatio(key, e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p className="flex justify-between">
          <span>Estimated levain hydration</span>
          <span className="font-semibold">{round1(composition.hydration)}%</span>
        </p>
        <p className="flex justify-between">
          <span>Flour in the levain</span>
          <span className="font-semibold">{round1(composition.flourPercentage)}%</span>
        </p>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        The levain is part of your total flour and water. {Number.isFinite(levainWeightPercentage) && (
          <>It will weigh about {round1(levainWeightPercentage)}% of the total flour weight. </>
        )}The starter is counted as equal parts flour and water.
      </p>

      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Levain flour</p>
        <FlourDistribution flours={levain.flours} onUpdate={(flours) => update({ flours })} />
      </div>
    </div>
  );
}
