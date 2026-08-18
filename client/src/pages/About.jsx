import { useState } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import PageBackground from '../components/PageBackground.jsx';
import { TargetIcon, PinIcon, CheckCircleIcon, LockIcon } from '../components/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { api } from '../context/api.js';

const SECTIONS = [
  {
    id: 'outcomes',
    titleKey: 'learningOutcomes',
    descKey: 'outcomesDesc',
    icon: TargetIcon,
    bg: 'from-sand to-peach-light',
  },
  {
    id: 'objectives',
    titleKey: 'learningObjectives',
    descKey: 'objectivesDesc',
    icon: PinIcon,
    bg: 'from-peach to-peach-light',
  },
  {
    id: 'indicators',
    titleKey: 'learningIndicators',
    descKey: 'indicatorsDesc',
    icon: CheckCircleIcon,
    bg: 'from-brown-200 to-brown-300',
  },
];

export default function About() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const { aboutDone, refresh } = useProgress();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  function openedKey(id) {
    return `cv_about_${user?.id}_${id}`;
  }

  function isOpened(id) {
    return Boolean(aboutDone) || localStorage.getItem(openedKey(id)) === '1';
  }

  function openSection(id) {
    localStorage.setItem(openedKey(id), '1');
    if (id === 'indicators' && !aboutDone) {
      api('/api/progress/about-done', { method: 'POST', token }).then(() => refresh());
    }
    setActive(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeSection = SECTIONS.find((s) => s.id === active);

  if (activeSection) {
    return (
      <div className="flex min-h-full flex-col">
        <PageBackground />
        <Navbar />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10">
          <div className="w-full animate-pop-in rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brown-200/60 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-brown-700">
                <activeSection.icon className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-bold text-brown-800">
                {t(`about.${activeSection.titleKey}`)}
              </h1>
            </div>

            {active === 'outcomes' && (
              <p className="leading-relaxed text-brown-700">{t('about.outcomesText')}</p>
            )}

            {active === 'objectives' && (
              <ol className="list-decimal space-y-2 pl-5 text-brown-700">
                {(Array.isArray(t('about.objectives')) ? t('about.objectives') : [t('about.objectives')]).map(
                  (o, i) => (
                    <li key={i}>{o}</li>
                  )
                )}
              </ol>
            )}

            {active === 'indicators' && (
              <ol className="space-y-3">
                {(Array.isArray(t('about.indicators')) ? t('about.indicators') : [t('about.indicators')]).map(
                  (ind, i) => (
                    <li key={i} className="rounded-2xl bg-cream p-4 text-brown-700">
                      <span className="leading-relaxed">{ind}</span>
                    </li>
                  )
                )}
              </ol>
            )}
          </div>

                    <div className="mt-6 text-center">
            <button
              onClick={() => setActive(null)}
              className="rounded-full bg-brown-100 px-6 py-2.5 font-semibold text-brown-800 transition-colors hover:bg-brown-200"
            >
              ← {t('about.back')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageBackground />
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <span className="rounded-full bg-peach px-4 py-1 text-xs font-bold uppercase tracking-widest text-brown-800">
            {t('nav.about')}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-brown-800 md:text-4xl">
            {t('about.title')}
          </h1>
        </div>

        <section className="grid w-full gap-5 md:grid-cols-3">
          {SECTIONS.map((s, i) => {
            const unlocked = i === 0 || isOpened(SECTIONS[i - 1].id);
            const done = isOpened(s.id);
            const content = (
              <>
                <div className="relative">
                  {!unlocked && (
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brown-800 text-cream shadow">
                      <LockIcon className="h-4 w-4" />
                    </span>
                  )}
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/60 text-brown-700 shadow-inner">
                    <s.icon className="h-9 w-9" />
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-brown-800">
                    {t(`about.${s.titleKey}`)}
                  </h2>
                  <p className="mt-1 text-sm text-brown-600">
                    {unlocked ? t(`about.${s.descKey}`) : t('home.locked')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-5 py-1.5 text-sm font-semibold shadow transition-transform ${
                    unlocked
                      ? 'bg-brown-800 text-cream group-hover:scale-105'
                      : 'bg-brown-100 text-brown-400'
                  }`}
                >
                  {unlocked ? (done ? t('about.read') : t('home.start')) : <LockIcon className="inline h-4 w-4" />}
                </span>
              </>
            );

            if (!unlocked) {
              return (
                <div
                  key={s.id}
                  className={`flex cursor-not-allowed flex-col items-center gap-4 rounded-3xl bg-gradient-to-br ${s.bg} p-8 text-center shadow-sm ring-1 ring-brown-200/50 opacity-70`}
                >
                  {content}
                </div>
              );
            }

            return (
              <button
                key={s.id}
                onClick={() => openSection(s.id)}
                className={`group flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br ${s.bg} p-8 text-center shadow-sm ring-1 ring-brown-200/50 transition-transform hover:-translate-y-1 hover:shadow-lg`}
              >
                {content}
              </button>
            );
          })}
        </section>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="rounded-full bg-brown-100 px-6 py-2.5 font-semibold text-brown-800 transition-colors hover:bg-brown-200"
          >
            ← {t('about.backToHome')}
          </button>
        </div>
      </main>
    </div>
  );
}
