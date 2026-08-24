import { createPortal } from 'react-dom';
import MathText from '../MathText.jsx';
import { DRAG_CARDS } from '../../data/drag.js';

const cardOf = (id) => DRAG_CARDS.find((c) => c.id === id);

export default function DragGhostPortal({ drag, position }) {
  const cardId = drag?.cardId;
  const card = cardId ? cardOf(cardId) : null;

  if (!drag || !card || !position) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed left-0 top-0 z-50 select-none rounded-xl bg-[#eab277] px-3 py-2.5 font-display text-sm font-bold text-brown-900 shadow-xl ring-2 ring-amber-500/80 rotate-2"
      style={{ transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)` }}
    >
      <MathText text={card.label} />
    </div>,
    document.body
  );
}