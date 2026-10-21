import { describe, it, expect } from 'vitest';
import { calculateRecipeFromTotalWeight } from './calculations';
import { buildMethod } from './method';

const base = { total: 1000, hydration: 75, saltPercentage: 2, flours: [{ type: 'BF', percentage: 100 }] };
const titles = (input) => buildMethod(calculateRecipeFromTotalWeight({ ...base, ...input })).map((s) => s.title);

describe('buildMethod', () => {
  it('autolyses before adding levain and salt', () => {
    const t = titles({});
    expect(t.indexOf('Autolyse')).toBeLessThan(t.indexOf('Add levain and salt'));
    expect(t).toContain('Bulk fermentation');
  });

  it('adds levain during fermentolyse and salt afterward', () => {
    const t = titles({ method: 'fermentolyse' });
    expect(t).toContain('Fermentolyse');
    expect(t).toContain('Add salt');
    expect(t).not.toContain('Autolyse');
  });

  it('mixes rye in one step with no autolyse or folds', () => {
    const t = titles({ breadType: 'rye' });
    expect(t).toContain('Mix everything together');
    expect(t).not.toContain('Autolyse');
    expect(t).not.toContain('Bulk fermentation');
  });

  it('includes scald and sifting steps only when enabled', () => {
    expect(titles({})).not.toContain('Make the scald');
    const t = titles({ scald: { enabled: true, flourPercentage: 10, waterMultiplier: 2 }, sifting: { enabled: true, extraction: 85 } });
    expect(t).toContain('Make the scald');
    expect(t).toContain('Sift the fresh-milled flour');
  });

  it('mentions water temperatures when set', () => {
    const steps = buildMethod(calculateRecipeFromTotalWeight({ ...base, temps: { dough: 85 } }));
    expect(steps.find((s) => s.title === 'Autolyse').detail).toContain('85°F');
  });

  it('lists hand folds in the bulk step', () => {
    const steps = buildMethod(calculateRecipeFromTotalWeight({ ...base, mixing: { type: 'hand', stretchFolds: 3, coilFolds: 2 } }));
    const bulk = steps.find((s) => s.title === 'Bulk fermentation').detail;
    expect(bulk).toContain('3 stretch and folds');
    expect(bulk).toContain('2 coil folds');
  });

  it('handles singular fold counts and zero folds', () => {
    const one = buildMethod(calculateRecipeFromTotalWeight({ ...base, mixing: { type: 'hand', stretchFolds: 1, coilFolds: 0 } }));
    expect(one.find((s) => s.title === 'Bulk fermentation').detail).toContain('1 stretch and fold,');
    const none = buildMethod(calculateRecipeFromTotalWeight({ ...base, mixing: { type: 'hand', stretchFolds: 0, coilFolds: 0 } }));
    expect(none.find((s) => s.title === 'Bulk fermentation').detail).toContain('no folds');
  });

  it('uses the mixer instead of folds for a stand mixer', () => {
    const steps = buildMethod(calculateRecipeFromTotalWeight({ ...base, mixing: { type: 'stand' } }));
    expect(steps.find((s) => s.title === 'Add levain and salt').detail).toContain('dough hook');
    expect(steps.find((s) => s.title === 'Bulk fermentation').detail).not.toContain('stretch and fold');
  });

  it('mixes rye with the paddle in a stand mixer', () => {
    const steps = buildMethod(calculateRecipeFromTotalWeight({ ...base, breadType: 'rye', mixing: { type: 'stand' } }));
    expect(steps.find((s) => s.title === 'Mix everything together').detail).toContain('paddle');
  });

  it('adds a bassinage step after mixing, before bulk, only when enabled', () => {
    expect(titles({})).not.toContain('Bassinage');
    const t = titles({ bassinage: { enabled: true, percentage: 5 } });
    expect(t.indexOf('Bassinage')).toBeGreaterThan(t.indexOf('Add levain and salt'));
    expect(t.indexOf('Bassinage')).toBeLessThan(t.indexOf('Bulk fermentation'));
  });

  const bakeText = (input) =>
    buildMethod(calculateRecipeFromTotalWeight({ ...base, ...input })).find((s) => s.title === 'Bake').detail;

  it('describes covered and uncovered stages for a Dutch oven', () => {
    const detail = bakeText({
      bake: { vessel: 'dutch', stages: [{ mode: 'covered', temp: 500, minutes: 18 }, { mode: 'dry', temp: 450, minutes: 25 }] },
    });
    expect(detail).toBe('Bake in a Dutch oven: 18 minutes at 500°F covered, then 25 minutes at 450°F uncovered.');
  });

  it('describes steamed and dry stages for a baking stone or steel', () => {
    const stone = bakeText({ bake: { vessel: 'stone', stages: [{ mode: 'steamed', temp: 480, minutes: 15 }, { mode: 'dry', temp: 460, minutes: 20 }] } });
    expect(stone).toContain('on a baking stone');
    expect(stone).toContain('15 minutes at 480°F open with steam, then 20 minutes at 460°F open and dry');
    expect(bakeText({ bake: { vessel: 'steel', stages: [{ mode: 'dry', temp: 500, minutes: 30 }] } })).toContain('on a baking steel');
  });

  it('preheats with the vessel inside, except for a pan', () => {
    const preheat = (vessel) =>
      buildMethod(calculateRecipeFromTotalWeight({ ...base, bake: { vessel, stages: [{ mode: 'dry', temp: 475, minutes: 40 }] } }))
        .find((s) => s.title === 'Preheat').detail;
    expect(preheat('steel')).toContain('baking steel inside');
    expect(preheat('pan')).toBe('Preheat the oven to 475°F.');
  });

  it('defaults rye to a pan and traditional to a Dutch oven, and no longer assumes a Dutch oven otherwise', () => {
    expect(calculateRecipeFromTotalWeight({ ...base, breadType: 'rye' }).bake.vessel).toBe('pan');
    expect(calculateRecipeFromTotalWeight(base).bake.vessel).toBe('dutch');
    expect(bakeText({ bake: { vessel: 'steel' } })).not.toContain('Dutch oven');
  });

  it('replaces a stage mode the vessel cannot do and bad numbers', () => {
    const r = calculateRecipeFromTotalWeight({
      ...base,
      bake: { vessel: 'dutch', stages: [{ mode: 'steamed', temp: 9999, minutes: 0 }] },
    });
    expect(r.bake.stages[0]).toEqual({ mode: 'dry', temp: 600, minutes: 1 });
  });

  it('lets a stone or steel start covered', () => {
    const detail = bakeText({ bake: { vessel: 'steel', stages: [{ mode: 'covered', temp: 475, minutes: 20 }, { mode: 'dry', temp: 450, minutes: 25 }] } });
    expect(detail).toContain('on a baking steel: 20 minutes at 475°F covered, then');
  });

  const seeds = { kind: 'seed', name: 'Flax', percentage: 10, soaked: true, soakWaterPercentage: 100 };

  it('adds a soak step only for soaked seeds, before mixing', () => {
    expect(titles({ inclusions: [{ ...seeds, soaked: false }] })).not.toContain('Soak the seeds');
    const t = titles({ inclusions: [seeds] });
    expect(t).toContain('Soak the seeds');
    expect(t.indexOf('Soak the seeds')).toBeLessThan(t.indexOf('Autolyse'));
  });

  it('mixes the soaker and sweeteners in with the levain and salt', () => {
    const detail = buildMethod(
      calculateRecipeFromTotalWeight({ ...base, inclusions: [seeds, { kind: 'sweetener', name: 'Honey', percentage: 3 }] })
    ).find((s) => s.title === 'Add levain and salt').detail;
    expect(detail).toContain('the soaked Flax');
    expect(detail).toMatch(/\d+g Honey/);
  });

  it('mixes Brotgewürz in, or coats the loaf, depending on the choice', () => {
    const mix = buildMethod(calculateRecipeFromTotalWeight({ ...base, spice: { enabled: true, percentage: 1, use: 'mix' } }));
    expect(mix.find((s) => s.title === 'Add levain and salt').detail).toContain('Brotgewürz');
    expect(mix.find((s) => s.title === 'Shape and proof').detail).not.toContain('Brotgewürz');

    const coat = buildMethod(calculateRecipeFromTotalWeight({ ...base, spice: { enabled: true, percentage: 1, use: 'coat' } }));
    expect(coat.find((s) => s.title === 'Add levain and salt').detail).not.toContain('Brotgewürz');
    expect(coat.find((s) => s.title === 'Shape and proof').detail).toContain('Brotgewürz');
  });

  it('coats the pan for rye', () => {
    const steps = buildMethod(calculateRecipeFromTotalWeight({ ...base, breadType: 'rye', spice: { enabled: true, percentage: 1, use: 'coat' } }));
    expect(steps.find((s) => s.title === 'Pan and proof').detail).toContain('Coat the greased pan');
  });

  const scaldDetail = (input) =>
    buildMethod(calculateRecipeFromTotalWeight({ ...base, ...input })).find((s) => s.title === 'Make the scald').detail;
  const scald = { enabled: true, flourPercentage: 10, waterMultiplier: 3 };

  it('scalds the sifted-out bran for a traditional loaf and sets it aside when sifting', () => {
    expect(scaldDetail({ scald })).toMatch(/\(3x the flour\) over \d+g of the sifted-out bran/);
    const sift = buildMethod(calculateRecipeFromTotalWeight({ ...base, scald })).find((s) => s.title === 'Sift the fresh-milled flour');
    expect(sift.detail).toContain('aside for the scald');
  });

  it('scalds a portion of the flour for rye', () => {
    expect(scaldDetail({ breadType: 'rye', scald })).toMatch(/over \d+g [A-Za-z ]+ flour and stir/);
  });

  const detail = (input, title) =>
    buildMethod(calculateRecipeFromTotalWeight({ ...base, ...input })).find((s) => s.title === title).detail;

  it('gives a rye levain no fixed time, only an estimate from its ratio', () => {
    const levain = (flour, water) => ({ percentage: 20, ratio: { seed: 1, flour, water } });
    expect(detail({ breadType: 'rye', levain: levain(15, 15) }, 'Build the levain')).toContain('roughly 15 hours');
    expect(detail({ breadType: 'rye', levain: levain(5, 5) }, 'Build the levain')).toContain('roughly 5 hours');
    expect(detail({ breadType: 'rye', levain: levain(10, 10) }, 'Build the levain')).toContain('roughly 10 hours');
    expect(detail({ breadType: 'rye', levain: levain(15, 15) }, 'Build the levain')).not.toContain('4–8');
  });

  it('scales the rye levain estimate by the starter parts', () => {
    const text = detail({ breadType: 'rye', levain: { percentage: 20, ratio: { seed: 2, flour: 10, water: 10 } } }, 'Build the levain');
    expect(text).toContain('roughly 5 hours');
  });

  it('keeps the fixed levain time for traditional bread', () => {
    expect(detail({}, 'Build the levain')).toContain('4–8 hours');
  });

  it('cools the scald to below 90°F', () => {
    const scald = { enabled: true, flourPercentage: 10, waterMultiplier: 2 };
    expect(detail({ scald }, 'Make the scald')).toContain('below 90°F');
    expect(detail({ breadType: 'rye', scald }, 'Make the scald')).toContain('below 90°F');
  });

  it('keeps the rye bulk to 30–90 minutes and requires 24 wrapped hours before cutting', () => {
    expect(detail({ breadType: 'rye' }, 'Short bulk')).toContain('30–90 minutes');
    const rest = detail({ breadType: 'rye' }, 'Rest');
    expect(rest).toContain('wrap');
    expect(rest).toContain('24 hours');
    expect(rest).toContain('cutting');
  });
});
