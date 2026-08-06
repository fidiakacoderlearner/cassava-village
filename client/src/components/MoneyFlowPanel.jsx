import { useI18n } from '../context/I18nContext.jsx';

export default function MoneyFlowPanel({ active }) {
  const { t } = useI18n();
  const flow = t('money.flow');

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 space-y-2 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-brown-200/60">
        <p className="px-1 font-display text-sm font-bold text-brown-500">
          {t('money.process')}
        </p>
        {flow.map((label, i) => {
          const isActive = active === i;
          const isPast = active != null && i < active;
          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brown-800 text-cream shadow'
                  : isPast
                    ? 'bg-brown-100 text-brown-600'
                    : 'bg-cream text-brown-400'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isActive ? 'bg-sand text-brown-800' : 'bg-white text-brown-500'
                }`}
              >
                {i + 1}
              </span>
              {label}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
