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

export function formatRupiah(n) {
  return `Rp${Number(n).toLocaleString('id-ID')}`;
}
