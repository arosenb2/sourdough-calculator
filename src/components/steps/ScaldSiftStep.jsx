import { Label, OptionCard, Toggle, inputClass } from './fields';
import { scaldMultipliersFor } from '../../types/recipe';
import WaterBudgetWarning from './WaterBudgetWarning';
import { availableDoughWaterPercentage, scaldPercentages } from '../../utils/calculations';

export default function ScaldSiftStep({ data, onChange }) {
  const { scald, bassinage, sifting } = data;
  const isRye = data.breadType === 'rye';
  const siftRequired = scald.enabled && !isRye;
  const setScald = (patch) => {
    const next = { ...scald, ...patch };
    // A traditional scald uses the bran sifted out of the flour, so turn sifting on with it
    onChange({
      scald: next,
      ...(next.enabled && !isRye && !sifting.enabled ? { sifting: { ...sifting, enabled: true } } : {}),
    });
  };
  const scaldWater = scaldPercentages(data).water;
  const available = availableDoughWaterPercentage(data.levain, data.hydration);
  const availableText = Number.isFinite(available) ? `About ${Math.round(available * 10) / 10}% of flour is dough water (hydration minus the levain's water), shared by scald and bassinage.` : '';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Toggle
          label="Include a scald"
          hint={
            isRye
              ? 'Some of the flour is soaked in hot water first.'
              : 'The bran sifted out of the flour is soaked in hot water first. This requires sifting.'
          }
          checked={scald.enabled}
          onChange={(enabled) => setScald({ enabled })}
        />
        {scald.enabled && (
          <div className="ml-7 space-y-4">
            <div>
              <Label htmlFor="scald-flour">
                Scald flour (% of the {isRye ? 'total flour' : 'sifted flour'})
              </Label>
              <input
                id="scald-flour"
                type="number"
                min="0.1"
                max="100"
                step="any"
                className={inputClass}
                value={scald.flourPercentage}
                onChange={(e) => setScald({ flourPercentage: e.target.value })}
              />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hot water, times the scald flour</p>
              <div className={`grid gap-3 ${isRye ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {scaldMultipliersFor(data.breadType).map((multiplier) => (
                  <OptionCard
                    key={multiplier}
                    selected={Number(scald.waterMultiplier) === multiplier}
                    title={`${multiplier}x`}
                    onClick={() => setScald({ waterMultiplier: multiplier })}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The scald water is about {Math.round(scaldWater * 10) / 10}% of total flour and comes out of the dough water. {availableText}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Toggle
          label="Use bassinage"
          hint="Hold back some water and add it after the dough has developed."
          checked={bassinage.enabled}
          onChange={(enabled) => onChange({ bassinage: { ...bassinage, enabled } })}
        />
        {bassinage.enabled && (
          <div className="ml-7">
            <Label htmlFor="bassinage-water">Bassinage water (% of flour)</Label>
            <input
              id="bassinage-water"
              type="number"
              min="0.1" step="any"
              className={inputClass}
              value={bassinage.percentage}
              onChange={(e) => onChange({ bassinage: { ...bassinage, percentage: e.target.value } })}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Taken out of the dough water, after any scald.</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Toggle
          label="Sift the flour"
          hint={siftRequired ? 'Required for a scald: the bran you sift out is what gets scalded.' : 'For fresh-milled flour.'}
          checked={sifting.enabled || siftRequired}
          disabled={siftRequired}
          onChange={(enabled) => onChange({ sifting: { ...sifting, enabled } })}
        />
        {sifting.enabled && (
          <div className="ml-7">
            <Label htmlFor="sift-extraction">Extraction (%)</Label>
            <input
              id="sift-extraction"
              type="number"
              min="50"
              max="100"
              className={inputClass}
              value={sifting.extraction}
              onChange={(e) => onChange({ sifting: { ...sifting, extraction: e.target.value } })}
            />
          </div>
        )}
      </div>

      <WaterBudgetWarning data={data} />
    </div>
  );
}
