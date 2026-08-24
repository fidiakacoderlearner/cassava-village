import MathText from '../MathText.jsx';
import { DRAG_CARDS } from '../../data/drag.js';

const cardOf = (id) => DRAG_CARDS.find((c) => c.id === id);

export default function DragSlot({
  targetSlot,
  slot1,
  slot2,
  drag,
  saved,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  canPlace,
  clearDrag,
  placeInSlot,
  moveCardToSlot,
  returnToPool,
}) {
  const cardId = targetSlot === 1 ? slot1 : slot2;
  const isDraggingOut = drag && drag.cardId === cardId && drag.from === targetSlot;
  const card = cardId ? cardOf(cardId) : null;

  const wrapperClass = card
    ? 'border-solid border-brown-300 bg-cream shadow-sm'
    : isDraggingOut
      ? 'border-dashed border-amber-400 bg-amber-50/50'
      : 'border-dashed border-brown-300 bg-cream/50 hover:border-amber-300';

  const buttonClass = isDraggingOut
    ? 'opacity-0'
    : saved
      ? 'cursor-default opacity-70'
      : '';

  return (
    <div
      data-slot={targetSlot}
      className={`flex h-20 w-full items-center justify-center rounded-2xl border-2 px-3 text-center transition-colors ${wrapperClass}`}
    >
      {card ? (
        <button
          onPointerDown={(e) => onPointerDown(e, card.id, targetSlot)}
          onPointerMove={(e) => onPointerMove(e, card.id)}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          disabled={saved}
          style={{ touchAction: 'none' }}
          className={`flex w-full items-center justify-center gap-1 rounded-xl bg-[#eab277] px-2 py-2 font-display text-sm font-bold text-brown-900 select-none active:cursor-grabbing ${buttonClass}`}
        >
          <MathText text={card.label} />
        </button>
      ) : (
        <span className="text-xs font-semibold text-brown-400">?</span>
      )}
    </div>
  );
}