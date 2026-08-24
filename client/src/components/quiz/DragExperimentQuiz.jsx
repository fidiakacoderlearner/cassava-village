import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import MathText from '../MathText.jsx';
import { DRAG_CARDS, DRAG_X, DRAG_BEST, DRAG_SUB } from '../../data/drag.js';
import DragConfirmModal from './DragConfirmModal.jsx';
import DragSlot from './DragSlot.jsx';
import DragGroup from './DragGroup.jsx';
import DragGhostPortal from './DragGhostPortal.jsx';

export default function DragExperimentQuiz({ question, initialAnswer, onSave, onContinue }) {
  const { t } = useI18n();
  const restored = Boolean(
    initialAnswer && typeof initialAnswer.slot1 === 'string' && typeof initialAnswer.slot2 === 'string'
  );
  const [slot1, setSlot1] = useState(restored ? initialAnswer.slot1 : null);
  const [slot2, setSlot2] = useState(restored ? initialAnswer.slot2 : null);
  const [saved, setSaved] = useState(restored);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drag, setDrag] = useState(null);
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });
  const pendingRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  const cardOf = (id) => DRAG_CARDS.find((c) => c.id === id);
  const complete = Boolean(slot1 && slot2);
  const validMix = complete && cardOf(slot1).group !== cardOf(slot2).group;
  const result = validMix ? Math.round(cardOf(slot2).fn(cardOf(slot1).fn(DRAG_X))) : null;

  const canPlace = () => !saved;

  const clearDrag = () => {
    pendingRef.current = null;
    setDrag(null);
  };

  const placeInSlot = (cardId, targetSlot) => {
    if (saved) return;
    if (targetSlot === 1) setSlot1(cardId);
    else setSlot2(cardId);
  };

  const moveCardToSlot = (cardId, targetSlot, from) => {
    if (saved) return;
    if (from === 1 && targetSlot !== 1) setSlot1(null);
    if (from === 2 && targetSlot !== 2) setSlot2(null);
    placeInSlot(cardId, targetSlot);
  };

  const returnToPool = (from) => {
    if (saved) return;
    if (from === 1) setSlot1(null);
    else if (from === 2) setSlot2(null);
  };

  const confirmSave = () => {
    setConfirmOpen(false);
    setSaved(true);
    if (onSave) onSave({ slot1, slot2, result });
  };

  const positionGhost = (x, y) => {
    posRef.current = { x, y };
    setGhostPosition({ x, y });
  };

  const handlePointerDown = (e, cardId, from) => {
    if (saved || drag) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pendingRef.current = { cardId, from, startX: e.clientX, startY: e.clientY, moved: false, pointerId: e.pointerId };
  };

  const handlePointerMove = (e, cardId) => {
    const p = pendingRef.current;
    if (!p || p.pointerId !== e.pointerId) return;
    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (!p.moved && Math.hypot(dx, dy) < 6) return;
    if (!p.moved) {
      p.moved = true;
      setDrag({ cardId, from: p.from });
    }
    positionGhost(e.clientX, e.clientY);
  };

  const resolveDrop = (e) => {
    const p = pendingRef.current;
    if (!p) return;
    const wasMoved = p.moved;
    clearDrag();
    if (!wasMoved) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slotEl = el?.closest?.('[data-slot]');
    const targetSlot = slotEl ? Number(slotEl.getAttribute('data-slot')) : null;
    if (targetSlot === p.from) return;
    const targetOccupied = targetSlot === 1 && slot1 !== null
      || targetSlot === 2 && slot2 !== null;
    if (targetSlot && !targetOccupied && canPlace()) {
      moveCardToSlot(p.cardId, targetSlot, p.from);
    } else {
      returnToPool(p.from);
    }
  };

  const handlePointerUp = (e) => {
    if (!pendingRef.current) return;
    if (pendingRef.current.pointerId !== e.pointerId) return;
    resolveDrop(e);
  };

  return (
    <div className="w-full rounded-3xl bg-peach-light/90 p-5 shadow-xl ring-1 ring-brown-200/60 animate-pop-in md:p-7">
      {question && (
        <h3 className="mb-4 text-left font-display text-base font-bold text-brown-800 md:text-lg leading-relaxed">
          <MathText text={question} />
        </h3>
      )}
      <p className="mb-3 text-left text-sm font-semibold text-brown-600">
        {t('exploration.dragInstruction')}
      </p>

      <div className="mb-2 flex items-center gap-3">
        <span className="flex-1 text-center text-[10px] font-bold uppercase tracking-wide text-brown-500">
          {t('exploration.dragStep1')}
        </span>
        <span className="w-16 shrink-0 sm:w-20" />
        <span className="flex-1 text-center text-[10px] font-bold uppercase tracking-wide text-brown-500">
          {t('exploration.dragStep2')}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <DragSlot
            targetSlot={1}
            slot1={slot1}
            slot2={slot2}
            drag={drag}
            saved={saved}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={clearDrag}
            canPlace={canPlace}
            clearDrag={clearDrag}
            placeInSlot={placeInSlot}
            moveCardToSlot={moveCardToSlot}
            returnToPool={returnToPool}
          />
        </div>
        <div className="flex w-16 shrink-0 items-center justify-center sm:w-20">
          <svg
            viewBox="0 0 80 16"
            className="h-6 w-full text-brown-800"
            aria-hidden="true"
          >
            <line x1="2" y1="8" x2="68" y2="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M66 2 L76 8 L66 14 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-1">
          <DragSlot
            targetSlot={2}
            slot1={slot1}
            slot2={slot2}
            drag={drag}
            saved={saved}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={clearDrag}
            canPlace={canPlace}
            clearDrag={clearDrag}
            placeInSlot={placeInSlot}
            moveCardToSlot={moveCardToSlot}
            returnToPool={returnToPool}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-cream/80 p-3 shadow-sm ring-1 ring-brown-200/60">
        <p className="text-center text-xs font-semibold text-brown-600">{t('exploration.dragRule')}</p>
        <div className="mt-3 space-y-3">
          <DragGroup
            groupKey="retribution"
            groupLabel={t('exploration.dragRetribution')}
            slot1={slot1}
            slot2={slot2}
            drag={drag}
            saved={saved}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={clearDrag}
          />
          <DragGroup
            groupKey="discount"
            groupLabel={t('exploration.dragDiscount')}
            slot1={slot1}
            slot2={slot2}
            drag={drag}
            saved={saved}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={clearDrag}
          />
        </div>
      </div>

      {complete && !validMix && (
        <p className="mt-3 text-center text-xs font-semibold text-amber-600 animate-shake">
          ⚠ {t('exploration.dragInvalidCombo')}
        </p>
      )}

      {(() => {
        if (saved) {
          return (
            <div className="mt-3 flex justify-end gap-2">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 ring-1 ring-green-300">
                  ✓ {t('exploration.dragSaved')}
                </span>
                <button
                  onClick={onContinue}
                  className="rounded-full bg-brown-800 px-7 py-2.5 font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {t('exploration.continue')}
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!complete || !validMix}
                  className="ml-auto rounded-full bg-green-600 px-6 py-2.5 font-display font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('exploration.dragSave')}
                </button>
              </div>
              <DragConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmSave}
                t={t}
              />
              <DragGhostPortal drag={drag} position={ghostPosition} />
            </>
          );
        }
      })()}
    </div>
  );
}