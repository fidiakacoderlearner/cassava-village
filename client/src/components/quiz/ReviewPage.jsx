import { useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import MathText from '../MathText.jsx';

export default function ReviewPage({ items, initialValues, saving, error, onSave, onBack }) {
  const { t } = useI18n();
  const [values, setValues] = useState(initialValues);
  const allFilled = items.every((it) => String(values[it.id] || '').trim());

  function handleSave() {
    if (!allFilled || saving) return;
    onSave(values);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto py-2 md:py-3">
      <div className="mx-auto max-w-2xl space-y-4 pb-8">
        {items.map((it, n) => (
          <div key={it.id} className="rounded-3xl bg-white/90 p-5 shadow-md ring-1 ring-brown-200/70">
            <p className="text-xs font-bold uppercase tracking-wide text-brown-500">
              {t('exploration.reviewQuestion', { n: n + 1 })}
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-brown-900"><MathText text={it.question} /></p>

            <textarea
              value={values[it.id] || ''}
              onChange={(e) => setValues((v) => ({ ...v, [it.id]: e.target.value }))}
              rows={3}
              placeholder={t('exploration.writeAnswer')}
              className="mt-3 w-full resize-none rounded-2xl border border-brown-200 bg-cream px-4 py-3 text-sm text-brown-900 placeholder-brown-400 shadow-xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>
        ))}

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="rounded-full bg-brown-200 px-5 py-2.5 text-sm font-bold text-brown-800 shadow transition-colors hover:bg-brown-300"
          >
            {t('exploration.back')}
          </button>

          <button
            onClick={handleSave}
            disabled={!allFilled || saving}
            className="rounded-full bg-brown-800 px-7 py-2.5 text-sm font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {saving ? '...' : t('exploration.saveFinal')}
          </button>
        </div>

        {!allFilled && (
          <p className="text-center text-xs font-semibold text-brown-500">{t('exploration.reviewRequired')}</p>
        )}
      </div>
    </div>
  );
}