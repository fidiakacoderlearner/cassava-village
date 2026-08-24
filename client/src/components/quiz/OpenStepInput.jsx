import { useEffect, useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import MathText from '../MathText.jsx';

export default function OpenStepInput({ step, value: initialValue, saved, onDraft, onSave, onUnsave, onContinue }) {
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    setValue(initialValue || '');
  }, [step.id, initialValue]);

  const canContinue = saved && value.trim().length > 0;

  return (
    <div className="mt-2 w-full animate-pop-in md:mt-3 lg:mt-2 xl:mt-4">
      <textarea
        value={value}
        readOnly={saved}
        onChange={(e) => {
          setValue(e.target.value);
          onDraft(step.id, e.target.value);
        }}
        rows={3}
        placeholder={t('exploration.writeAnswer')}
        className={`w-full resize-none rounded-2xl border px-3 py-2 text-xs text-brown-900 placeholder-brown-400 shadow-xs outline-none transition md:px-4 md:py-2.5 md:text-sm lg:px-3 lg:py-2 lg:text-xs xl:px-4 xl:py-3 xl:text-sm 2xl:px-5 2xl:py-3.5 2xl:text-base ${
          saved
            ? 'border-green-300 bg-green-50/70'
            : 'border-brown-200 bg-white/95 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
        }`}
      />

      <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5 md:mt-2.5 md:gap-2 lg:mt-2 lg:gap-1.5 xl:mt-3 xl:gap-2 2xl:mt-4 2xl:gap-2.5">
        {saved ? (
          <>
            <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700 md:px-2.5 md:py-1 md:text-xs lg:px-2 lg:py-0.5 lg:text-[10px] xl:px-3 xl:py-1.5 xl:text-xs 2xl:px-4 2xl:py-2 2xl:text-sm">
              ✓ {t('exploration.saved')}
            </span>
            <button
              onClick={onUnsave}
              className="rounded-full bg-brown-200 px-3 py-1.5 text-[10px] font-display font-bold text-brown-800 shadow-sm transition-transform hover:scale-105 active:scale-95 md:px-4 md:py-2 md:text-xs lg:px-3 lg:py-1.5 lg:text-[10px] xl:px-5 xl:py-2.5 xl:text-xs 2xl:px-6 2xl:py-3 2xl:text-sm"
            >
              ✎ {t('exploration.edit')}
            </button>
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className="rounded-full bg-brown-800 px-4 py-1.5 text-[10px] font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 md:px-5 md:py-2 md:text-xs lg:px-4 lg:py-1.5 lg:text-[10px] xl:px-7 xl:py-2.5 xl:text-xs 2xl:px-8 2xl:py-3 2xl:text-sm"
            >
              {t('exploration.continue')}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSave(value)}
              disabled={!value.trim()}
              className="rounded-full bg-green-600 px-4 py-1.5 text-[10px] font-display font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 md:px-5 md:py-2 md:text-xs lg:px-4 lg:py-1.5 lg:text-[10px] xl:px-6 xl:py-2.5 xl:text-xs 2xl:px-7 2xl:py-3 2xl:text-sm"
            >
              ✓ {t('exploration.saveAnswer')}
            </button>
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className="rounded-full bg-brown-800 px-4 py-1.5 text-[10px] font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 md:px-5 md:py-2 md:text-xs lg:px-4 lg:py-1.5 lg:text-[10px] xl:px-7 xl:py-2.5 xl:text-xs 2xl:px-8 2xl:py-3 2xl:text-sm"
            >
              {t('exploration.continue')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}