import { BAKE_VESSELS, FLOUR_TYPES } from '../types/recipe';

const at = (temp) => (temp === null || temp === undefined ? '' : ` at ${temp}°F`);

const weighted = (flours, key) =>
  flours
    .filter((f) => f[key] > 0)
    .map((f) => `${f[key]}g ${FLOUR_TYPES[f.type]}`)
    .join(', ');

// A rye levain takes roughly as many hours as the flour parts per part of starter
// (1:5:5 about 5 hours, 1:10:10 about 10, 1:15:15 about 15), so no fixed time is given
const ryeLevainHours = ({ seed, flour }) => Math.max(1, Math.round(flour / seed));

const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;

const foldsText = ({ stretchFolds, coilFolds }) => {
  const parts = [];
  if (stretchFolds > 0) parts.push(count(stretchFolds, 'stretch and fold'));
  if (coilFolds > 0) parts.push(count(coilFolds, 'coil fold'));
  return parts.join(' and ');
};

/**
 * Builds the ordered method steps for a calculated recipe. Rye skips the
 * autolyse and long gluten-development phase of a traditional loaf.
 */
export const buildMethod = (recipe) => {
  const { levain, scald, bassinage, sifting, temps, inclusions, mixing, bake, spice } = recipe;
  const byHand = mixing.type === 'hand';
  const isRye = recipe.breadType === 'rye';
  const steps = [];

  steps.push({
    title: 'Build the levain',
    detail:
      `Mix ${levain.seed}g starter, ${weighted(levain.flours, 'weight')} and ${levain.water}g water${at(temps.levain)} ` +
      `(${levain.ratio.seed}:${levain.ratio.flour}:${levain.ratio.water}). ${
        isRye
          ? `Let it ripen until domed and active. A rye levain takes about as many hours as its feed ratio, so roughly ${ryeLevainHours(levain.ratio)} hours here.`
          : 'Let it ripen until domed and active, about 4–8 hours.'
      }`,
  });

  const soaked = inclusions.filter((i) => i.kind === 'seed' && i.soaked);
  if (soaked.length) {
    steps.push({
      title: 'Soak the seeds',
      detail:
        `Combine ${soaked.map((i) => `${i.weight}g ${i.name} with ${i.soakWater}g water`).join('; ')}. ` +
        'Cover and soak for 8–12 hours or overnight. Do not drain: the soak water is part of the dough water.',
    });
  }

  if (sifting.enabled) {
    steps.push({
      title: 'Sift the fresh-milled flour',
      detail:
        `Sift to about ${sifting.extraction}% extraction. ` +
        (scald.enabled && !isRye
          ? 'Set the sifted-out bran aside for the scald.'
          : 'Keep the bran for dusting or add some back.'),
    });
  }

  if (scald.enabled) {
    steps.push({
      title: 'Make the scald',
      detail:
        `Pour ${scald.water}g hot water${at(temps.scald)} (${scald.waterMultiplier}x the flour) over ` +
        `${isRye ? weighted(recipe.flours, 'scaldWeight') : `${scald.flour}g of the sifted-out bran`} and stir into a paste. Let it cool to below 90°F before mixing.`,
    });
  }

  const inclusionText = (i) => (i.soaked ? `the soaked ${i.name}` : `${i.weight}g ${i.name}`);
  const mixedIn = [
    ...inclusions.map(inclusionText),
    ...(spice.enabled && spice.use === 'mix' ? [`${spice.total}g Brotgewürz`] : []),
  ];
  const addIns = mixedIn.length ? mixedIn.join(', ') : null;
  const coating = spice.enabled && spice.use === 'coat' ? `${spice.total}g Brotgewürz` : null;
  // The scald's flour is poured over separately, so the main dough only has the rest
  const doughFlour = weighted(recipe.flours, 'mainWeight');
  const waterLabel = `${recipe.waterToAdd}g water${at(temps.dough)}`;

  const pushBake = () => {
    const vessel = BAKE_VESSELS[bake.vessel];
    const stages = bake.stages
      .map((stage) => `${stage.minutes} minutes at ${stage.temp}°F ${vessel.modes[stage.mode].phrase}`)
      .join(', then ');
    steps.push({
      title: 'Preheat',
      detail: `Preheat the oven to ${bake.stages[0].temp}°F${
        vessel.preheatWith ? ` with the ${vessel.label.toLowerCase()} inside for at least 45 minutes` : ''
      }.`,
    });
    steps.push({
      title: 'Bake',
      detail: `Bake ${vessel.phrase}: ${stages}.${isRye ? ' The loaf is done at an internal temperature of 205–210°F.' : ''}`,
    });
  };

  const pushBassinage = () => {
    if (!bassinage.enabled) return;
    steps.push({
      title: 'Bassinage',
      detail: `Once the dough has come together, add the held-back ${bassinage.water}g water${at(temps.dough)} a little at a time, mixing until each addition is absorbed.`,
    });
  };

  if (isRye) {
    steps.push({
      title: 'Mix everything together',
      detail:
        `Combine ${doughFlour}, ${waterLabel}, ${levain.total}g levain, ${recipe.salt}g salt${scald.enabled ? ` and the cooled scald (${scald.flour + scald.water}g)` : ''}` +
        `${addIns ? `, plus ${addIns}` : ''}. No autolyse: rye has little gluten. ${
          byHand ? 'Mix by hand or with a wet spatula' : 'Mix in a stand mixer with the paddle on low'
        } for 3–5 minutes into a thick, sticky paste with no dry pockets.`,
    });
    pushBassinage();
    steps.push({
      title: 'Short bulk',
      detail: 'Cover and rest 30–90 minutes. No stretch and folds.',
    });
    steps.push({
      title: 'Pan and proof',
      detail:
        `${coating ? `Coat the greased pan with the ${coating}. ` : ''}With wet hands or a wet spatula, scrape into the pan and smooth the top. Proof until it has risen about a third and small cracks appear, 45–90 minutes.`,
    });
    pushBake();
    steps.push({
      title: 'Rest',
      detail: 'Let it cool, then wrap it and wait a full 24 hours before cutting so the crumb sets.',
    });
    return steps;
  }

  const incorporate = (what) =>
    byHand
      ? `Work in ${what} by hand, squeezing and folding until incorporated.`
      : `Add ${what}, then mix with the dough hook on low for 2 minutes and on medium for 3–5 minutes until smooth and elastic.`;

  if (recipe.method === 'fermentolyse') {
    steps.push({
      title: 'Fermentolyse',
      detail:
        `Mix ${doughFlour}, ${waterLabel}${scald.enabled ? `, the cooled scald (${scald.flour + scald.water}g)` : ''} and ${levain.total}g levain until no dry flour remains. Rest 30–60 minutes.`,
    });
    steps.push({
      title: 'Add salt',
      detail: `${incorporate(`${recipe.salt}g salt${addIns ? ` and ${addIns}` : ''}`)}`,
    });
  } else {
    steps.push({
      title: 'Autolyse',
      detail: `Mix ${doughFlour} with ${waterLabel}${scald.enabled ? ` and the cooled scald (${scald.flour + scald.water}g)` : ''}. Rest 30–60 minutes.`,
    });
    steps.push({
      title: 'Add levain and salt',
      detail: incorporate(`${levain.total}g levain and ${recipe.salt}g salt${addIns ? `, then ${addIns}` : ''}`),
    });
  }

  pushBassinage();

  steps.push({
    title: 'Bulk fermentation',
    detail: byHand
      ? foldsText(mixing)
        ? `Do ${foldsText(mixing)}, spaced about 30 minutes apart, then let it rise until about 50–75% larger.`
        : 'Leave it undisturbed with no folds until it is about 50–75% larger.'
      : 'Cover and let it rise until about 50–75% larger. The mixer has built the strength, so no folds are needed.',
  });
  steps.push({
    title: 'Shape and proof',
    detail: `Pre-shape, rest 20 minutes, final shape${
      coating ? `, then roll or press the loaf in the ${coating}` : ''
    }, then proof in the fridge 8–16 hours or at room temperature until puffy.`,
  });
  pushBake();
  return steps;
};
