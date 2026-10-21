import { OptionCard } from './fields';
import { defaultBake, typeDefaults } from '../../utils/recipeDefaults';

export default function BreadTypeStep({ data, onChange }) {
  const choose = (breadType) => {
    if (breadType === data.breadType) return;
    const defaults = typeDefaults(breadType);
    const isRye = breadType === 'rye';
    onChange({
      breadType,
      bake: defaultBake(breadType),
      hydration: defaults.hydration,
      salt: defaults.salt,
      flours: defaults.flours,
      scald: defaults.scald,
      // Rye is mixed in one go, and its levain is rye
      method: isRye ? 'mix' : 'autolyse',
      sifting: { ...data.sifting, enabled: false },
      levain: {
        ...data.levain,
        percentage: defaults.levainPercentage,
        ratio: defaults.levainRatio,
        flours: [{ type: isRye ? 'RY' : 'BF', percentage: 100 }],
      },
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <OptionCard
        selected={data.breadType === 'traditional'}
        title="Traditional"
        onClick={() => choose('traditional')}
      />
      <OptionCard
        selected={data.breadType === 'rye'}
        title="Rye"
        onClick={() => choose('rye')}
      />
    </div>
  );
}
