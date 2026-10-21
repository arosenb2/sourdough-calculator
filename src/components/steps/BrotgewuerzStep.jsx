import { SPICES } from '../../types/recipe';
import { Label, OptionCard, Toggle, inputClass } from './fields';

export default function BrotgewuerzStep({ data, onChange }) {
  const { spice } = data;
  const set = (patch) => onChange({ spice: { ...spice, ...patch } });
  const setRatio = (key, value) => set({ ratios: { ...spice.ratios, [key]: value } });

  const parts = Object.keys(SPICES).map((key) => (spice.ratios[key] === '' ? 0 : parseFloat(spice.ratios[key]) || 0));
  const sum = parts.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <Toggle
        label="Use Brotgewürz"
        hint="A bread spice blend, common in rye breads."
        checked={spice.enabled}
        onChange={(enabled) => set({ enabled })}
      />

      {spice.enabled && (
        <>
          <div>
            <Label htmlFor="spice-pct">Total blend (% of flour)</Label>
            <input
              id="spice-pct"
              type="number"
              min="0.1"
              max="10"
              step="any"
              className={inputClass}
              value={spice.percentage}
              onChange={(e) => set({ percentage: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <OptionCard selected={spice.use === 'mix'} title="Mix in" onClick={() => set({ use: 'mix' })} />
            <OptionCard selected={spice.use === 'coat'} title="Coat" onClick={() => set({ use: 'coat' })} />
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Blend ratio (parts)</p>
            {Object.entries(SPICES).map(([key, label], i) => (
              <div key={key} className="flex items-center gap-3">
                <label htmlFor={`spice-${key}`} className="flex-1 text-gray-700 dark:text-gray-300">{label}</label>
                <input
                  id={`spice-${key}`}
                  type="number"
                  min="0"
                  step="any"
                  className={`${inputClass} w-24`}
                  value={spice.ratios[key]}
                  onChange={(e) => setRatio(key, e.target.value)}
                />
                <span className="w-14 text-right text-sm text-gray-500 dark:text-gray-400">
                  {sum > 0 ? `${Math.round((parts[i] / sum) * 100)}%` : ''}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
