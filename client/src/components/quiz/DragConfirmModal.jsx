import { useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';

export default function DragConfirmModal({ isOpen, onClose, onConfirm, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brown-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md animate-pop-in rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-brown-200">
        <h2 className="font-display text-xl font-bold text-brown-800">{t('exploration.dragConfirmTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-brown-600">{t('exploration.dragConfirmDesc')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full bg-brown-100 px-6 py-2.5 font-semibold text-brown-800 transition-colors hover:bg-brown-200"
          >
            {t('exit.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-green-600 px-6 py-2.5 font-display font-semibold text-white shadow transition-transform hover:scale-105"
          >
            {t('exploration.dragConfirmYes')}
          </button>
        </div>
      </div>
    </div>
  );
}