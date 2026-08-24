import { useI18n } from '../../context/I18nContext.jsx';

export default function DialogueActions({ onContinue }) {
  const { t } = useI18n();
  return (
    <div className="mt-2 flex justify-end animate-pop-in md:mt-2.5 lg:mt-2 xl:mt-3 2xl:mt-4">
      <button
        onClick={onContinue}
        className="ml-auto rounded-full bg-brown-800 px-4 py-1.5 font-display text-[10px] font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95 md:px-5 md:py-2 md:text-xs lg:px-4 lg:py-1.5 lg:text-[10px] xl:px-7 xl:py-2.5 xl:text-xs 2xl:px-8 2xl:py-3 2xl:text-sm"
      >
        {t('exploration.continue')}
      </button>
    </div>
  );
}