import React from 'react';
import { formatPercentage, formatWeight } from '../../utils/formatting';
import { buildMethod } from '../../utils/method';
import { BAKE_VESSELS, BREAD_TYPES, FLOUR_TYPES, METHODS, MIXING_TYPES, SPICES } from '../../types/recipe';

const cell = 'text-gray-800 dark:text-gray-200';
const headCell = 'border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-600 dark:text-gray-300';
const totalCell = 'font-semibold border-t border-gray-200 dark:border-gray-600 pt-2 text-gray-800 dark:text-white';
const heading = 'text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200';
const panel = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4';

function Row({ label, sub, weight, percentage }) {
  return (
    <>
      <div className={cell}>
        {label}
        {sub && <span className="block text-xs text-gray-500 dark:text-gray-400">{sub}</span>}
      </div>
      <div className={`text-right ${cell}`}>{formatWeight(weight)}</div>
      <div className={`text-right ${cell}`}>{formatPercentage(percentage)}%</div>
    </>
  );
}

function WeightRow({ label, sub, weight }) {
  return (
    <>
      <div className={cell}>
        {label}
        {sub && <span className="block text-xs text-gray-500 dark:text-gray-400">{sub}</span>}
      </div>
      <div className={`text-right ${cell}`}>{formatWeight(weight)}</div>
    </>
  );
}

const tempText = (temp) => (temp === null || temp === undefined ? null : `${temp}°F`);
const round1 = (n) => Math.round(n * 10) / 10;

// Short note under an inclusion: its soak water and/or the water it carries
const inclusionNote = (item, final = false) =>
  [
    item.soakWater > 0 && `soaked in ${formatWeight(item.soakWater)} water${final ? ', not drained' : ''}`,
    item.water > 0 && `${formatWeight(item.water)} water`,
  ]
    .filter(Boolean)
    .join(' · ') || undefined;

export default function RecipeDetails({ recipe }) {
  const { levain, scald, bassinage, sifting, temps, inclusions, mixing, bake, spice } = recipe;
  const handFolds = mixing.type === 'hand' && recipe.breadType !== 'rye';
  const levainWater = recipe.water - recipe.doughWater;
  const waterSources = [
    levainWater > 0 && `${formatWeight(levainWater)} in levain`,
    recipe.soakWater > 0 && `${formatWeight(recipe.soakWater)} in soaker`,
    recipe.inclusionWater > 0 && `${formatWeight(recipe.inclusionWater)} in inclusions`,
    bassinage.enabled && bassinage.water > 0 && `${formatWeight(bassinage.water)} bassinage`,
  ].filter(Boolean);
  const totalPercentage =
    recipe.flours.reduce((sum, flour) => sum + flour.overallPercentage, 0) +
    (Number(recipe.hydration) || 0) +
    (Number(recipe.saltPercentage) || 0) +
    inclusions.reduce((sum, i) => sum + i.percentage, 0) +
    (spice.enabled ? spice.percentage : 0);

  const settings = [
    ['Bread type', BREAD_TYPES[recipe.breadType]],
    ['Method', METHODS[recipe.method]],
    ['Mixing', MIXING_TYPES[mixing.type]],
    ['Stretch and folds', handFolds ? String(mixing.stretchFolds) : null],
    ['Coil folds', handFolds ? String(mixing.coilFolds) : null],
    ['Scald', scald.enabled ? `${formatWeight(scald.flour)} flour + ${formatWeight(scald.water)} water (${scald.waterMultiplier}x)` : 'None'],
    ['Bassinage', bassinage.enabled ? `${formatWeight(bassinage.water)} water` : 'None'],
    ['Sifting', sifting.enabled ? `${sifting.extraction}% extraction` : 'None'],
    ['Levain water', tempText(temps.levain)],
    ['Dough water', tempText(temps.dough)],
    ['Scald water', scald.enabled ? tempText(temps.scald) : null],
    ['Baked in', BAKE_VESSELS[bake.vessel].label],
    ...bake.stages.map((stage, index) => [
      `Bake stage ${index + 1}`,
      `${BAKE_VESSELS[bake.vessel].modes[stage.mode].label} · ${stage.temp}°F · ${stage.minutes} min`,
    ]),
  ].filter(([, value]) => value);

  return (
    <div className="space-y-6">
      <section>
        <h2 className={heading}>Overall Formula</h2>
        <div className={panel}>
          <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] gap-x-3 gap-y-3">
            <div className={headCell}>Component</div>
            <div className={`text-right ${headCell}`}>Weight</div>
            <div className={`text-right ${headCell}`}>Baker's %</div>

            {recipe.flours.map((flour, index) => (
              <Row
                key={index}
                label={FLOUR_TYPES[flour.type]}
                sub={flour.levainWeight > 0 ? `${formatWeight(flour.levainWeight)} in levain` : undefined}
                weight={flour.weight}
                percentage={flour.overallPercentage}
              />
            ))}
            <Row
              label="Water"
              sub={waterSources.length ? waterSources.join(' · ') : undefined}
              weight={recipe.water}
              percentage={recipe.hydration}
            />
            <Row label="Salt" weight={recipe.salt} percentage={recipe.saltPercentage} />
            {inclusions.map((item, index) => (
              <Row
                key={index}
                label={item.name}
                sub={inclusionNote(item)}
                weight={item.weight}
                percentage={item.percentage}
              />
            ))}
            {spice.enabled && (
              <Row
                label="Brotgewürz"
                sub={spice.use === 'coat' ? 'coating' : 'mixed in'}
                weight={spice.total}
                percentage={spice.percentage}
              />
            )}

            <div className={totalCell}>Total</div>
            <div className={`text-right ${totalCell}`}>{formatWeight(recipe.total)}</div>
            <div className={`text-right ${totalCell}`}>{formatPercentage(totalPercentage)}%</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            The levain ({formatWeight(levain.total)}, {round1(levain.weightPercentage)}% of flour) is included in the
            flour and water above.
          </p>
        </div>
      </section>

      <section>
        <h2 className={heading}>Levain Build</h2>
        <div className={panel}>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Ratio {levain.ratio.seed}:{levain.ratio.flour}:{levain.ratio.water} (starter : flour : water). About{' '}
            {round1(levain.hydration)}% hydration and {round1(levain.flourFraction)}% flour by weight. Prefermented flour is{' '}
            {round1(levain.flourPercentage)}% of the total flour.
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <WeightRow label="Starter" weight={levain.seed} />
            {levain.flours.map((flour, index) => (
              <WeightRow key={index} label={FLOUR_TYPES[flour.type]} weight={flour.weight} />
            ))}
            <WeightRow label="Water" weight={levain.water} />
          </div>
        </div>
      </section>

      {scald.enabled && (
        <section>
          <h2 className={heading}>Scald</h2>
          <div className={panel}>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {scald.waterMultiplier}x water to flour{tempText(temps.scald) ? `, water at ${tempText(temps.scald)}` : ''}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {recipe.flours
                .filter((flour) => flour.scaldWeight > 0)
                .map((flour, index) => (
                  <WeightRow key={index} label={FLOUR_TYPES[flour.type]} weight={flour.scaldWeight} />
                ))}
              <WeightRow label="Hot water" weight={scald.water} />
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className={heading}>Final Dough</h2>
        <div className={panel}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {recipe.flours
              .filter((flour) => flour.mainWeight > 0)
              .map((flour, index) => (
                <WeightRow key={index} label={FLOUR_TYPES[flour.type]} weight={flour.mainWeight} />
              ))}
            <WeightRow label="Water" weight={recipe.waterToAdd} />
            {bassinage.enabled && <WeightRow label="Bassinage water" sub="added after mixing" weight={bassinage.water} />}
            <WeightRow label="Levain" weight={levain.total} />
            {scald.enabled && <WeightRow label="Scald" sub="cooled" weight={scald.flour + scald.water} />}
            <WeightRow label="Salt" weight={recipe.salt} />
            {inclusions.map((item, index) => (
              <WeightRow
                key={index}
                label={item.soaked ? `${item.name} (soaked)` : item.name}
                sub={inclusionNote(item, true)}
                weight={item.weight}
              />
            ))}
            {spice.enabled && spice.use === 'mix' && <WeightRow label="Brotgewürz" weight={spice.total} />}
          </div>
        </div>
      </section>

      {spice.enabled && (
        <section>
          <h2 className={heading}>Brotgewürz</h2>
          <div className={panel}>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {spice.use === 'coat' ? 'Used to coat the loaf' : 'Mixed into the dough'} · {formatWeight(spice.total)} total
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {spice.blend.map((part) => (
                <WeightRow key={part.type} label={SPICES[part.type]} weight={part.weight} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className={heading}>Process</h2>
        <dl className={`${panel} grid grid-cols-2 gap-x-3 gap-y-2`}>
          {settings.map(([label, value]) => (
            <React.Fragment key={label}>
              <dt className="text-gray-600 dark:text-gray-300">{label}</dt>
              <dd className={`text-right ${cell}`}>{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>

      <section>
        <h2 className={heading}>Method</h2>
        <ol className="space-y-3 list-decimal list-inside">
          {buildMethod(recipe).map((step) => (
            <li key={step.title} className={cell}>
              <span className="font-semibold">{step.title}.</span> {step.detail}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
