import MathText from '../MathText.jsx';
import { DRAG_CARDS } from '../../data/drag.js';

export default function DragGroup({
  groupKey,
  groupLabel,
  slot1,
  slot2,
  drag,
  saved,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-brown-500">{groupLabel}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {DRAG_CARDS.filter((c) => c.group === groupKey).map((card) => {
          const placed = slot1 === card.id || slot2 === card.id;
          const isDragging = drag && drag.cardId === card.id && drag.from === 'pool';

          let cardClass = '';
          if (placed) {
            cardClass = 'invisible';
          } else if (isDragging) {
            cardClass = 'opacity-0';
          } else if (saved) {
            cardClass = 'bg-brown-100 text-brown-400 ring-brown-200 cursor-not-allowed opacity-60';
          } else {
            cardClass = 'bg-[#eab277] text-brown-900 ring-brown-400/60 hover:bg-[#eaa76a] active:scale-95 cursor-grab active:cursor-grabbing';
          }

          return (
            <button
              key={card.id}
              onPointerDown={(e) => onPointerDown(e, card.id, 'pool')}
              onPointerMove={(e) => onPointerMove(e, card.id)}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              disabled={saved}
              style={{ touchAction: 'none' }}
              className={`select-none rounded-xl px-3 py-2.5 font-display text-sm font-bold shadow-sm ring-1 transition-all ${cardClass}`}
            >
              <MathText text={card.label} />
            </button>
          );
        })}
      </div>
    </div>
  );
}