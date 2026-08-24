import {
  DRAG_X,
  DRAG_BEST,
  DRAG_CARDS,
  DRAG_SUB,
  EXPERIMENT_ROWS,
  DRAG_FN,
  DRAG_COMBOS,
  EVAL_STEP_IDS,
  OPEN_STEP_IDS,
} from '@shared/constants.js';

export { DRAG_X, DRAG_BEST, DRAG_CARDS, DRAG_SUB, EXPERIMENT_ROWS, DRAG_FN, DRAG_COMBOS, EVAL_STEP_IDS, OPEN_STEP_IDS };

export function formatRupiah(n) {
  return `Rp${Number(n).toLocaleString('id-ID')}`;
}
