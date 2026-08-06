import { createPortal } from 'react-dom';
import { useI18n } from '../context/I18nContext.jsx';

export default function ExplainModal({ open, question, answer, explain, onContinue }) {
  const { t } = useI18n();

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-pop-in">
      <div className="absolute inset-0 bg-brown-900/60 backdrop-blur-xs" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-cream shadow-2xl ring-2 ring-brown-300">
        <div className="bg-brown-800 px-5 py-3">
          <h3 className="font-display text-lg font-bold text-cream">{t('exploration.explanationTitle')}</h3>
        </div>

        <div className="space-y-3 p-5">
          {question && (
            <p className="rounded-2xl bg-white/80 p-3 text-sm font-medium text-brown-900 ring-1 ring-brown-200/60">
              {question}
            </p>
          )}

          {answer && (
            <p className="rounded-2xl bg-green-100 p-3 text-sm font-bold text-green-900 ring-1 ring-green-300">
              {t('exploration.answer')}: {answer}
            </p>
          )}

          {explain && (
            <p className="rounded-2xl bg-amber-50 p-3 text-sm font-medium text-brown-800 ring-1 ring-amber-200/70">
              {t('exploration.explanation')}: {explain}
            </p>
          )}
        </div>

        <div className="px-5 pb-5 text-right">
          <button
            onClick={onContinue}
            className="rounded-full bg-brown-800 px-7 py-2.5 font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('exploration.continue')} →
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
