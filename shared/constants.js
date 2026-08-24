export const OPEN_STEP_IDS = [
  'open-gof-machines',
  'open-gof-money',
  'open-fog-money',
  'open-restu-calc',
  'open-rafif-calc',
  'open-difference-explanation',
  'open-conclusion',
];

export const EXPLORE_STEP_IDS = [
  'intro',
  'peeling-machine',
  'peeling-function',
  'washing-machine',
  'washing-function',
  'machine-flow',
  'quiz-peel',
  'quiz-wash',
  'composition-explanation',
  'open-gof-machines',
  'money-gross',
  'money-intro',
  'quiz-discount',
  'quiz-retribution',
  'open-gof-money',
  'rafif-intro',
  'rafif-story',
  'open-fog-money',
  'open-restu-calc',
  'open-rafif-calc',
  'open-difference-explanation',
  'open-conclusion',
  'quiz-drag-experiment',
  'dialogue-experiment-result',
];

export const EVAL_STEP_IDS = [
  'eval-1',
  'eval-2',
  'eval-3',
  'eval-4',
  'eval-5',
];

export const TOTAL_OPEN_STEPS = OPEN_STEP_IDS.length;

export const DRAG_X = 1000000;
export const DRAG_BEST = 912000;

export const DRAG_CARDS = [
  { id: 'f1', group: 'retribution', label: '<i>f<sub>1</sub>(x)</i> = <i>x</i> − 60.000', fn: (x) => x - 60000 },
  { id: 'f2', group: 'retribution', label: '<i>f<sub>2</sub>(x)</i> = 0,95<i>x</i>', fn: (x) => 0.95 * x },
  { id: 'g1', group: 'discount', label: '<i>g<sub>1</sub>(x)</i> = <i>x</i> − 40.000', fn: (x) => x - 40000 },
  { id: 'g2', group: 'discount', label: '<i>g<sub>2</sub>(x)</i> = 0,9<i>x</i>', fn: (x) => 0.9 * x },
];

export const DRAG_SUB = { f1: '<i>f<sub>1</sub></i>', f2: '<i>f<sub>2</sub></i>', g1: '<i>g<sub>1</sub></i>', g2: '<i>g<sub>2</sub></i>' };

export const EXPERIMENT_ROWS = [
  { combo: '(<i>g<sub>1</sub> ∘ f<sub>1</sub></i>)(<i>x</i>)', value: 'Rp900.000' },
  { combo: '(<i>f<sub>1</sub> ∘ g<sub>1</sub></i>)(<i>x</i>)', value: 'Rp900.000' },
  { combo: '(<i>g<sub>2</sub> ∘ f<sub>1</sub></i>)(<i>x</i>)', value: 'Rp846.000' },
  { combo: '(<i>f<sub>1</sub> ∘ g<sub>2</sub></i>)(<i>x</i>)', value: 'Rp840.000' },
  { combo: '(<i>g<sub>1</sub> ∘ f<sub>2</sub></i>)(<i>x</i>)', value: 'Rp910.000' },
  { combo: '(<i>f<sub>2</sub> ∘ g<sub>1</sub></i>)(<i>x</i>)', value: 'Rp912.000', best: true },
  { combo: '(<i>g<sub>2</sub> ∘ f<sub>2</sub></i>)(<i>x</i>)', value: 'Rp855.000' },
  { combo: '(<i>f<sub>2</sub> ∘ g<sub>2</sub></i>)(<i>x</i>)', value: 'Rp855.000' },
];

export const DRAG_FN = {
  f1: (x) => x - 60000,
  f2: (x) => 0.95 * x,
  g1: (x) => x - 40000,
  g2: (x) => 0.9 * x,
};

export const DRAG_COMBOS = [
  { slot1: 'f1', slot2: 'g1' },
  { slot1: 'g1', slot2: 'f1' },
  { slot1: 'f2', slot2: 'g2' },
  { slot1: 'g2', slot2: 'f2' },
  { slot1: 'f1', slot2: 'g2' },
  { slot1: 'g2', slot2: 'f1' },
  { slot1: 'g1', slot2: 'f2' },
  { slot1: 'f2', slot2: 'g1' },
];