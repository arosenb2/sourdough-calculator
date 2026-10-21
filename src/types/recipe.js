// Grouped for display in the flour picker. Keys are stored in saved recipes and
// share links, so never rename or reuse one.
export const FLOUR_GROUPS = [
  {
    id: 'store',
    label: 'Commercial (Store Bought)',
    flours: {
      BF: 'Bread flour',
      AP: 'All-Purpose flour',
      T00: '00 flour',
      WW: 'Whole Wheat flour',
      RY: 'Light Rye flour',
      RM: 'Medium Rye flour',
      RD: 'Dark Rye flour',
      SP: 'Spelt flour',
      EK: 'Einkorn flour',
      KM: 'Kamut flour',
      DR: 'Durum flour',
      SM: 'Semolina flour',
      BK: 'Buckwheat flour',
      OT: 'Oat flour',
      GF: 'Gluten-Free blend',
      RC: 'Rice flour',
      AL: 'Almond flour',
      CO: 'Coconut flour',
      CP: 'Chickpea flour',
    },
  },
  {
    id: 'fresh',
    label: 'Fresh Milled',
    flours: {
      HR: 'Hard Red Wheat (fresh milled)',
      HW: 'Hard White Wheat (fresh milled)',
      SW: 'Soft White Wheat (fresh milled)',
      FR: 'Rye (fresh milled)',
      FS: 'Spelt (fresh milled)',
      FE: 'Einkorn (fresh milled)',
      FK: 'Kamut (fresh milled)',
      FH: 'Khorasan (fresh milled)',
    },
  },
];

export const FLOUR_TYPES = Object.assign({}, ...FLOUR_GROUPS.map((group) => group.flours));

export const BREAD_TYPES = {
  traditional: 'Traditional',
  rye: 'Rye',
};

// Rye is always mixed in one go, so it only ever uses 'mix'.
export const METHODS = {
  autolyse: 'Autolyse',
  fermentolyse: 'Fermentolyse',
  mix: 'Single mix',
};

export const DEFAULT_LEVAIN_PERCENTAGE = 10; // prefermented flour: flour in the levain, % of total flour
export const DEFAULT_LEVAIN_RATIO = { seed: 1, flour: 5, water: 5 };
export const DEFAULT_SIFT_EXTRACTION = 85; // % of the grain left after sifting

export const MIXING_TYPES = {
  hand: 'By hand',
  stand: 'Stand mixer',
};

// Where the loaf bakes, and the ways each setup can run a stage. `phrase` is used
// mid-sentence in the method; mode keys are stored in recipes, so don't rename them.
export const BAKE_VESSELS = {
  dutch: {
    label: 'Dutch oven',
    phrase: 'in a Dutch oven',
    preheatWith: true,
    modes: {
      covered: { label: 'Covered', phrase: 'covered' },
      dry: { label: 'Uncovered', phrase: 'uncovered' },
    },
  },
  stone: {
    label: 'Baking stone',
    phrase: 'on a baking stone',
    preheatWith: true,
    modes: {
      covered: { label: 'Covered', phrase: 'covered' },
      steamed: { label: 'Open, steamed', phrase: 'open with steam' },
      dry: { label: 'Open, dry', phrase: 'open and dry' },
    },
  },
  steel: {
    label: 'Baking steel',
    phrase: 'on a baking steel',
    preheatWith: true,
    modes: {
      covered: { label: 'Covered', phrase: 'covered' },
      steamed: { label: 'Open, steamed', phrase: 'open with steam' },
      dry: { label: 'Open, dry', phrase: 'open and dry' },
    },
  },
  pan: {
    label: 'Loaf pan',
    phrase: 'in a loaf pan',
    preheatWith: false,
    modes: {
      covered: { label: 'Covered with foil', phrase: 'covered with foil' },
      steamed: { label: 'Steamed', phrase: 'with steam' },
      dry: { label: 'Uncovered', phrase: 'uncovered' },
    },
  },
};

export const MAX_BAKE_STAGES = 5;

// Quick picks for the target dough weight, grouped by container. Grams.
export const WEIGHT_GROUPS = [
  {
    id: 'loaf',
    label: 'Loaf Pan',
    presets: [
      { id: 'loaf-small', label: 'Small (1 lb)', grams: 454 },
      { id: 'loaf-medium', label: 'Medium (1.5 lb)', grams: 680 },
      { id: 'loaf-large', label: 'Large (2 lb)', grams: 907 },
    ],
  },
  {
    id: 'pullman',
    label: 'Pullman Pan',
    presets: [
      { id: 'pullman-small', label: 'Small', grams: 450 },
      { id: 'pullman-regular', label: 'Regular', grams: 800 },
      { id: 'pullman-large', label: 'Large', grams: 1000 },
      { id: 'pullman-xl', label: 'Extra large', grams: 1200 },
    ],
  },
  {
    id: 'banneton',
    label: 'Banneton',
    presets: [
      { id: 'boule-small', label: 'Small boule', grams: 750 },
      { id: 'boule-regular', label: 'Regular boule/batard', grams: 1000 },
    ],
  },
];

// Inclusions come in kinds so seeds can be soaked and sweeteners picked from a list
export const INCLUSION_KINDS = ['seed', 'sweetener', 'other'];
export const SWEETENERS = ['Molasses', 'Honey', 'Maple syrup'];

// Brotgewürz (bread spice blend): ingredients and their default ratio parts
export const SPICES = {
  caraway: 'Caraway seed',
  coriander: 'Ground coriander',
  fennel: 'Fennel seed',
  anise: 'Anise seed',
  allspice: 'Ground allspice',
};
export const DEFAULT_SPICE_RATIOS = { caraway: 4, coriander: 2, fennel: 2, anise: 1, allspice: 1 };
export const DEFAULT_SPICE_PERCENTAGE = 1; // % of flour
export const DEFAULT_SOAK_WATER_PERCENTAGE = 100; // % of the seed weight

// Scald: a portion of the flour is mixed with hot water at 1x, 2x or 3x its weight
export const SCALD_MULTIPLIERS = [1, 2, 3];
// A rye scald is realistically no wetter than 2x; anything more leaves the dough too little water
export const scaldMultipliersFor = (breadType) => (breadType === 'rye' ? [1, 2] : SCALD_MULTIPLIERS);
export const DEFAULT_SCALD_FLOUR_PERCENTAGE = 10; // % of the scalded base (sifted flour, or total flour for rye)
export const DEFAULT_SCALD_MULTIPLIER = 2;
// Rye starting values, taken from a real 750g loaf: a 1:7:7 rye levain (10:74:74 rounded to whole numbers) holding 20% of the
// flour, a scald of 20% of the flour at 2x water, 88% hydration, 2% salt, and 90% rye overall.
export const RYE_DEFAULTS = {
  levainPercentage: 20,
  levainRatio: { seed: 1, flour: 7, water: 7 },
  hydration: 88,
  salt: 2,
  scaldFlourPercentage: 20,
  flours: [
    { type: 'RY', percentage: 90 },
    { type: 'BF', percentage: 10 },
  ],
};
// Flours that count as "the rye flour" when sizing a rye scald
export const RYE_FLOURS = new Set(['RY', 'RM', 'RD', 'FR']);

// Water content of common inclusions, as % of their weight. Whatever water an inclusion
// carries counts toward the dough's hydration. Known ones use these values; others are entered by hand.
export const KNOWN_INCLUSIONS = [
  { name: 'Honey', hydration: 17 },
  { name: 'Molasses', hydration: 22 },
  { name: 'Maple syrup', hydration: 33 },
  { name: 'Pumpkin puree', hydration: 90 },
  { name: 'Egg', hydration: 75 },
  { name: 'Butter', hydration: 16 },
  { name: 'Milk', hydration: 87 },
  { name: 'Yogurt', hydration: 85 },
  { name: 'Applesauce', hydration: 85 },
];

// A known ingredient's water content is fixed: it's applied automatically and can't be overridden
export const findKnownInclusion = (name) =>
  KNOWN_INCLUSIONS.find((item) => item.name.toLowerCase() === String(name ?? '').trim().toLowerCase());
