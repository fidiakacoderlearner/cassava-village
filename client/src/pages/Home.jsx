import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import PageBackground from '../components/PageBackground.jsx';
import AssetImage from '../components/AssetImage.jsx';
import { ImageIcon, LockIcon } from '../components/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { api } from '../context/api.js';
import { STORY } from '../data/story.js';

const CARDS = [
  {
    to: '/about',
    key: 'about',
    asset: 'card-about',
    bg: 'from-sand to-peach-light',
    flag: null,
  },
  {
    to: '/exploration',
    key: 'exploration',
    asset: 'card-exploration',
    bg: 'from-peach to-peach-light',
    flag: 'aboutDone',
  },
  {
    to: '/evaluation',
    key: 'evaluation',
    asset: 'card-evaluation',
    bg: 'from-brown-200 to-brown-300',
    flag: null,
  },
];

export default function Home() {
  const { user, token } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const progress = useProgress();
  const { loading } = progress;
  const [showResume, setShowResume] = useState(false);

  const storageKey = `cv_step_${user?.id}`;
  const savedStep = Number(localStorage.getItem(storageKey));
  const hasSavedStep = Number.isFinite(savedStep) && savedStep > 0;

  function openExploration() {
    if (hasSavedStep) {
      setShowResume(true);
      return;
    }
    if (progress.explorationDone) {
      startOver();
      return;
    }
    navigate('/exploration');
  }

  async function startOver() {
    setShowResume(false);
    try {
      await api('/api/progress/reset-exploration', { method: 'POST', token });
    } catch {
      /* ignore */
    }
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`cv_essays_${user?.id}`);
    localStorage.removeItem(`cv_drag_answer_${user?.id}`);
    navigate('/exploration');
  }

  function continueResume() {
    setShowResume(false);
    navigate('/exploration');
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageBackground />
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10">
        <section className="mb-6 text-center">
          <p className="font-display text-4xl font-bold text-brown-800 md:text-5xl">
            {t('home.greeting').replace('{name}', user?.name || '')}
          </p>
        </section>

        <div className="w-full rounded-[2.5rem] bg-[#fae7cd] p-5 shadow-xl ring-1 ring-brown-300 md:p-7">
        <section className="text-center">
          <p className="mx-auto max-w-2xl leading-relaxed text-brown-800">
            {t('home.intro')}
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {CARDS.map((card) => {
            const locked = !loading && card.flag && !progress[card.flag];
            const content = (
              <>
                <div className="relative">
                  {locked && (
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brown-800 text-cream shadow">
                      <LockIcon className="h-4 w-4" />
                    </span>
                  )}
                  <AssetImage
                    name={card.asset}
                    alt={t(`home.cards.${card.key}`)}
                    className="h-20 w-20 rounded-3xl object-cover shadow"
                    fallback={
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-brown-300 bg-white/40 shadow-inner">
                        <ImageIcon className="h-7 w-7 text-brown-300" />
                      </div>
                    }
                  />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-brown-800">
                    {t(`home.cards.${card.key}`)}
                  </h2>
                  <p className="mt-1 text-sm text-brown-600">
                    {locked ? t('home.locked') : t(`home.cards.${card.key}Desc`)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-5 py-1.5 text-sm font-semibold shadow transition-transform ${
                    locked
                      ? 'bg-brown-100 text-brown-400'
                      : 'bg-brown-800 text-cream group-hover:scale-105'
                  }`}
                >
                  {locked ? <LockIcon className="inline h-4 w-4" /> : t('home.start')}
                </span>
              </>
            );

            if (locked) {
              return (
                <div
                  key={card.key}
                  className={`flex cursor-not-allowed flex-col items-center gap-4 rounded-3xl bg-gradient-to-br ${card.bg} p-6 text-center shadow-sm ring-1 ring-brown-200/50 opacity-70`}
                >
                  {content}
                </div>
              );
            }

            if (card.to === '/exploration') {
              return (
                <button
                  key={card.key}
                  onClick={openExploration}
                  className={`group flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br ${card.bg} p-6 text-center shadow-sm ring-1 ring-brown-200/50 transition-transform hover:-translate-y-1 hover:shadow-lg`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={card.key}
                to={card.to}
                className={`group flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br ${card.bg} p-6 text-center shadow-sm ring-1 ring-brown-200/50 transition-transform hover:-translate-y-1 hover:shadow-lg`}
              >
                {content}
              </Link>
            );
          })}
        </section>
        </div>

        {showResume && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brown-900/60 backdrop-blur-sm" aria-hidden="true" />
            <div className="relative w-full max-w-md animate-pop-in rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-brown-200">
              <h2 className="font-display text-xl font-bold text-brown-800">
                {t('exploration.resumeTitle')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brown-600">
                {t('exploration.resumeMessage', { current: Math.min(savedStep + 1, STORY.length), total: STORY.length })}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={startOver}
                  className="rounded-full bg-brown-100 px-6 py-2.5 font-semibold text-brown-800 transition-colors hover:bg-brown-200"
                >
                  {t('exploration.restart')}
                </button>
                <button
                  onClick={continueResume}
                  className="rounded-full bg-brown-800 px-6 py-2.5 font-display font-semibold text-cream shadow transition-transform hover:scale-105"
                >
                  {t('exploration.resume')} →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
