import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DEFAULT_SOAK_WATER_PERCENTAGE, KNOWN_INCLUSIONS, SWEETENERS, findKnownInclusion } from '../../types/recipe';
import { Toggle, inputClass } from './fields';
import WaterBudgetWarning from './WaterBudgetWarning';

const NEW_ITEM = {
  seed: { kind: 'seed', name: '', percentage: '', soaked: false, soakWaterPercentage: DEFAULT_SOAK_WATER_PERCENTAGE },
  sweetener: { kind: 'sweetener', name: SWEETENERS[0], percentage: '' },
  other: { kind: 'other', name: '', percentage: '', hydration: '' },
};

function Section({ title, hint, kind, inclusions, onChange, children }) {
  const items = inclusions.map((item, index) => ({ item, index })).filter(({ item }) => (item.kind || 'other') === kind);
  const add = () => onChange([...inclusions, { ...NEW_ITEM[kind] }]);

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        {hint && <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
      {items.map(({ item, index }) => children(item, index))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
      >
        <PlusIcon className="h-4 w-4" />
        Add {title.toLowerCase().replace(/s$/, '')}
      </button>
    </section>
  );
}

export default function InclusionsStep({ data, onChange }) {
  const { inclusions } = data;
  const setAll = (next) => onChange({ inclusions: next });
  const update = (index, patch) => setAll(inclusions.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index) => setAll(inclusions.filter((_, i) => i !== index));

  const removeButton = (index) => (
    <button
      type="button"
      onClick={() => remove(index)}
      aria-label="Remove"
      className="p-2 text-gray-500 hover:text-red-600"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  );

  const percentageInput = (item, index, label) => (
    <>
      <input
        aria-label={label}
        type="number"
        min="0"
        max="100"
        step="any"
        placeholder="%"
        className={`${inputClass} w-24`}
        value={item.percentage}
        onChange={(e) => update(index, { percentage: e.target.value })}
      />
      <span className="text-gray-600 dark:text-gray-400">%</span>
    </>
  );

  const waterInput = (item, index) =>
    findKnownInclusion(item.name) ? null : (
    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      Water content
      <input
        aria-label="Water content, percent of weight"
        type="number"
        min="0"
        max="100"
        step="any"
        placeholder="0"
        className={`${inputClass} w-24`}
        value={item.hydration ?? ''}
        onChange={(e) => update(index, { hydration: e.target.value })}
      />
      % of weight
    </label>
    );

  return (
    <div className="space-y-8">
      <Section
        title="Seeds"
        hint="Vollkornbrot-style seeds and grains. Soaked seeds get a soaker whose water counts toward the dough water."
        kind="seed"
        inclusions={inclusions}
        onChange={setAll}
      >
        {(item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                aria-label="Seed name"
                type="text"
                placeholder="e.g. Sunflower seeds"
                maxLength={60}
                className={inputClass}
                value={item.name}
                onChange={(e) => update(index, { name: e.target.value })}
              />
              {percentageInput(item, index, 'Seed percentage of flour')}
              {removeButton(index)}
            </div>
            <div className="ml-1 flex flex-wrap items-center gap-x-6 gap-y-2">
              <Toggle
                label="Soak"
                checked={Boolean(item.soaked)}
                onChange={(soaked) => update(index, { soaked })}
              />
              {item.soaked && (
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  Soak water
                  <input
                    aria-label="Soak water percentage of seed weight"
                    type="number"
                    min="0"
                    max="500"
                    step="any"
                    className={`${inputClass} w-24`}
                    value={item.soakWaterPercentage}
                    onChange={(e) => update(index, { soakWaterPercentage: e.target.value })}
                  />
                  % of seed weight
                </label>
              )}
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Sweeteners"
        hint="Molasses, honey or maple syrup, as a percentage of flour."
        kind="sweetener"
        inclusions={inclusions}
        onChange={setAll}
      >
        {(item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <select
                aria-label="Sweetener"
                className={inputClass}
                value={item.name}
                onChange={(e) => update(index, { name: e.target.value })}
              >
                {SWEETENERS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {percentageInput(item, index, 'Sweetener percentage of flour')}
              {removeButton(index)}
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Other inclusions"
        hint="Nuts, fruit, egg, butter, puree or anything else. Egg, butter, milk and the like already count their own water; for anything else you can enter its water content."
        kind="other"
        inclusions={inclusions}
        onChange={setAll}
      >
        {(item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                aria-label="Inclusion name"
                type="text"
                placeholder="e.g. Walnuts"
                maxLength={60}
                className={inputClass}
                value={item.name}
                onChange={(e) => update(index, { name: e.target.value })}
              />
              {percentageInput(item, index, 'Inclusion percentage of flour')}
              {removeButton(index)}
            </div>
            <div className="ml-1 flex flex-wrap items-center gap-x-6 gap-y-2">
              <select
                aria-label="Common ingredient"
                className={`${inputClass} w-auto`}
                value=""
                onChange={(e) => {
                  const known = KNOWN_INCLUSIONS.find((k) => k.name === e.target.value);
                  if (known) update(index, { name: known.name, hydration: '' });
                }}
              >
                <option value="">Fill in a common ingredient…</option>
                {KNOWN_INCLUSIONS.map(({ name }) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {waterInput(item, index)}
            </div>
          </div>
        )}
      </Section>

      <WaterBudgetWarning data={data} />

      <p className="text-sm text-gray-500 dark:text-gray-400">Percentages are of total flour weight.</p>
    </div>
  );
}
