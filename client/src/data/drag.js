export const DRAG_X = 1000000;
export const DRAG_BEST = 912000;

export const DRAG_CARDS = [
  { id: 'f1', group: 'retribution', label: 'f₁(x) = x − 60.000', fn: (x) => x - 60000 },
  { id: 'f2', group: 'retribution', label: 'f₂(x) = 0,95x', fn: (x) => 0.95 * x },
  { id: 'g1', group: 'discount', label: 'g₁(x) = x − 40.000', fn: (x) => x - 40000 },
  { id: 'g2', group: 'discount', label: 'g₂(x) = 0,9x', fn: (x) => 0.9 * x },
];

export const DRAG_SUB = { f1: 'f₁', f2: 'f₂', g1: 'g₁', g2: 'g₂' };

export const EXPERIMENT_ROWS = [
  { combo: '(g₁ ∘ f₁)(x)', value: 'Rp900.000' },
  { combo: '(f₁ ∘ g₁)(x)', value: 'Rp900.000' },
  { combo: '(g₂ ∘ f₁)(x)', value: 'Rp846.000' },
  { combo: '(f₁ ∘ g₂)(x)', value: 'Rp840.000' },
  { combo: '(g₁ ∘ f₂)(x)', value: 'Rp910.000' },
  { combo: '(f₂ ∘ g₁)(x)', value: 'Rp912.000', best: true },
  { combo: '(g₂ ∘ f₂)(x)', value: 'Rp855.000' },
  { combo: '(f₂ ∘ g₂)(x)', value: 'Rp855.000' },
];

export function formatRupiah(n) {
  return `Rp${Number(n).toLocaleString('id-ID')}`;
}
