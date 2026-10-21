import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BAKE_VESSELS, MAX_BAKE_STAGES } from '../../types/recipe';
import { defaultBake } from '../../utils/recipeDefaults';
import { Label, OptionCard, inputClass } from './fields';

export default function BakeStep({ data, onChange }) {
  const { bake } = data;
  const vessel = BAKE_VESSELS[bake.vessel];
  const modes = Object.entries(vessel.modes);

  const chooseVessel = (key) => {
    if (key !== bake.vessel) onChange({ bake: defaultBake(data.breadType, key) });
  };
  const setStages = (stages) => onChange({ bake: { ...bake, stages } });
  const updateStage = (index, patch) =>
    setStages(bake.stages.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)));
  const removeStage = (index) => setStages(bake.stages.filter((_, i) => i !== index));
  const addStage = () => {
    const last = bake.stages[bake.stages.length - 1];
    setStages([...bake.stages, { mode: 'dry', temp: last?.temp ?? 450, minutes: 10 }]);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(BAKE_VESSELS).map(([key, { label }]) => (
          <OptionCard key={key} selected={bake.vessel === key} title={label} onClick={() => chooseVessel(key)} />
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Baking stages, in order</p>
        {bake.stages.map((stage, index) => (
          <div key={index} className="grid grid-cols-[1fr_5rem_5rem_auto] gap-2 items-end">
            <div>
              <Label htmlFor={`stage-mode-${index}`}>Stage {index + 1}</Label>
              <select
                id={`stage-mode-${index}`}
                className={inputClass}
                value={stage.mode}
                onChange={(e) => updateStage(index, { mode: e.target.value })}
              >
                {modes.map(([mode, { label }]) => (
                  <option key={mode} value={mode}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor={`stage-temp-${index}`}>°F</Label>
              <input
                id={`stage-temp-${index}`}
                type="number"
                min="200"
                max="600"
                className={inputClass}
                value={stage.temp}
                onChange={(e) => updateStage(index, { temp: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`stage-min-${index}`}>Min</Label>
              <input
                id={`stage-min-${index}`}
                type="number"
                min="1"
                max="300"
                className={inputClass}
                value={stage.minutes}
                onChange={(e) => updateStage(index, { minutes: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeStage(index)}
              disabled={bake.stages.length === 1}
              aria-label={`Remove stage ${index + 1}`}
              className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        {bake.stages.length < MAX_BAKE_STAGES && (
          <button
            type="button"
            onClick={addStage}
            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
          >
            <PlusIcon className="h-4 w-4" />
            Add stage
          </button>
        )}
      </div>
    </div>
  );
}
