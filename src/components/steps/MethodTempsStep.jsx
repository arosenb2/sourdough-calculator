import { Label, OptionCard, inputClass } from './fields';
import { MIXING_TYPES } from '../../types/recipe';

export default function MethodTempsStep({ data, onChange }) {
  const { temps } = data;
  const setTemp = (key, value) => onChange({ temps: { ...temps, [key]: value } });
  const isRye = data.breadType === 'rye';
  const { mixing } = data;
  const setMixing = (patch) => onChange({ mixing: { ...mixing, ...patch } });

  const tempFields = [
    { key: 'levain', label: 'Levain build water (°F)' },
    { key: 'dough', label: isRye ? 'Mixing water (°F)' : 'Dough water (°F)' },
    ...(data.scald.enabled ? [{ key: 'scald', label: 'Scald water (°F)' }] : []),
  ];

  return (
    <div className="space-y-6">
      {isRye ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Rye is mixed in a single step, so there is no autolyse or fermentolyse to choose.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            selected={data.method === 'autolyse'}
            title="Autolyse"
            description="Flour and water rest first. Levain and salt go in afterward."
            onClick={() => onChange({ method: 'autolyse' })}
          />
          <OptionCard
            selected={data.method === 'fermentolyse'}
            title="Fermentolyse"
            description="Flour, water and levain rest together. Salt goes in afterward."
            onClick={() => onChange({ method: 'fermentolyse' })}
          />
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Mixing</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(MIXING_TYPES).map(([type, label]) => (
            <OptionCard key={type} selected={mixing.type === type} title={label} onClick={() => setMixing({ type })} />
          ))}
        </div>
        {mixing.type === 'hand' && !isRye && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="stretch-folds">Stretch and folds</Label>
              <input
                id="stretch-folds"
                type="number"
                min="0"
                max="20"
                step="1"
                className={inputClass}
                value={mixing.stretchFolds}
                onChange={(e) => setMixing({ stretchFolds: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="coil-folds">Coil folds</Label>
              <input
                id="coil-folds"
                type="number"
                min="0"
                max="20"
                step="1"
                className={inputClass}
                value={mixing.coilFolds}
                onChange={(e) => setMixing({ coilFolds: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Water temperatures (optional)</p>
        {tempFields.map(({ key, label }) => (
          <div key={key}>
            <Label htmlFor={`temp-${key}`}>{label}</Label>
            <input
              id={`temp-${key}`}
              type="number"
              min="32"
              max="212"
              className={inputClass}
              value={temps[key]}
              onChange={(e) => setTemp(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
