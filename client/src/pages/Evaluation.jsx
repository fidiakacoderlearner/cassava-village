import { useState } from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import PageBackground from '../components/PageBackground.jsx';
import ExitModal from '../components/ExitModal.jsx';
import { TrophyIcon, LogOutIcon } from '../components/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { playCorrect, playWrong } from '../context/AudioContext.jsx';
import { api } from '../context/api.js';
import { EVALUATION } from '../data/evaluation.js';

function shuffledIndexes(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Evaluation() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [selections, setSelections] = useState([]);
  const [orders] = useState(() => EVALUATION.map((q) => shuffledIndexes(t(`quiz.${q.id}.options`).length)));
  const [saving, setSaving] = useState(false);
  const [showExit, setShowExit] = useState(false);

  const q = current >= 0 ? EVALUATION[current] : null;
  const qBase = q ? `quiz.${q.id}` : '';
  const qText = q ? t(`${qBase}.text`) : '';
  const qOptions = q ? t(`${qBase}.options`) : [];
  const qExplain = q ? t(`${qBase}.explain`) : '';
  const qOrder = q ? orders[current] || [] : [];
  const qShuffled = qOrder.map((o) => qOptions[o]);
  const correctPos = q ? qOrder.indexOf(q.correct) : -1;
  const isLast = current >= EVALUATION.length - 1;
  const correctCount = results.filter((r) => r).length;
  const summaryKey =
    correctCount === EVALUATION.length
      ? 'summaryPerfect'
      : correctCount > 4
        ? 'summaryGood'
        : correctCount >= 3
          ? 'summaryFair'
          : 'summaryLow';

  async function submit() {
    if (selected == null || submitted) return;
    const isCorrect = selected === correctPos;
    if (isCorrect) playCorrect();
    else playWrong();
    setSaving(true);
    try {
      await api('/api/answers', {
        method: 'POST',
        token,
        body: { stepId: q.id, answer: qShuffled[selected], isCorrect },
      });
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
    setResults((prev) => [...prev, isCorrect]);
    setSelections((prev) => [...prev, selected]);
    setSubmitted(true);
  }

  function next() {
    setSelected(null);
    setSubmitted(false);
    if (isLast) {
      setCurrent(-1); // show result screen
    } else {
      setCurrent((c) => c + 1);
    }
  }

  return (
    <div className="min-h-full">
      <PageBackground />
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <span className="rounded-full bg-peach px-4 py-1 text-xs font-bold uppercase tracking-widest text-brown-800">
            {t('nav.evaluation')}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold text-brown-800">
            {t('evaluation.title')}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-brown-600">{t('evaluation.intro')}</p>
        </div>

        <button
          onClick={() => setShowExit(true)}
          className="fixed right-4 top-24 z-20 flex items-center gap-2 rounded-full bg-brown-800 px-4 py-2 text-xs font-bold text-cream shadow-lg transition-transform hover:scale-105"
        >
          <LogOutIcon className="h-4 w-4" />
          {t('exit.leave')}
        </button>
        <ExitModal open={showExit} onClose={() => setShowExit(false)} />

        {current === -1 ? (
          <div className="animate-pop-in rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-brown-200/60">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sand to-peach text-brown-700">
              <TrophyIcon className="h-10 w-10" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-brown-800">
              {t('evaluation.yourScore')}
            </h2>
            <p className="mt-2 text-5xl font-bold text-brown-700">
              {t('evaluation.outOf', { score: correctCount, total: EVALUATION.length })}
            </p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-brown-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-peach to-brown-600 transition-all duration-700"
                style={{ width: `${(correctCount / EVALUATION.length) * 100}%` }}
              />
            </div>

            <div
              className={`mt-6 rounded-2xl p-4 text-sm font-medium ring-1 ${
                summaryKey === 'summaryPerfect'
                  ? 'bg-green-100 text-green-800 ring-green-400'
                  : summaryKey === 'summaryGood'
                    ? 'bg-green-50 text-green-700 ring-green-300'
                    : summaryKey === 'summaryFair'
                      ? 'bg-peach/60 text-brown-800 ring-peach'
                      : 'bg-red-50 text-red-700 ring-red-300'
              }`}
            >
              {t(`evaluation.${summaryKey}`)}
            </div>

            <div className="mt-8 space-y-3 text-left">
              <h3 className="text-center font-display text-xl font-bold text-brown-800">
                {t('evaluation.reviewTitle')}
              </h3>
              {EVALUATION.map((ev, i) => {
                const base = `quiz.${ev.id}`;
                const opts = t(`${base}.options`);
                const qOrder = orders[i] || [];
                const qShuffled = qOrder.map((o) => opts[o]);
                const isRight = results[i];
                const chosen = selections[i];
                const userAnswer = qShuffled[chosen];
                const rightAnswer = opts[ev.correct];
                return (
                  <div
                    key={ev.id}
                    className={`rounded-2xl p-4 ring-1 ${
                      isRight ? 'bg-green-50 ring-green-200' : 'bg-red-50 ring-red-200'
                    }`}
                  >
                    <p className="font-semibold text-brown-800">
                      <span className="mr-1.5 font-bold">{i + 1}.</span>
                      {t(`${base}.text`)}
                    </p>
                    <div className="mt-2 text-sm">
                      {isRight ? (
                        <p className="font-semibold text-green-700">
                          ✓ {t('evaluation.yourAnswer')}: {userAnswer}
                        </p>
                      ) : (
                        <>
                          <p className="font-semibold text-red-700">
                            ✗ {t('evaluation.yourAnswer')}: {userAnswer}
                          </p>
                          <p className="mt-1 font-semibold text-green-700">
                            {t('evaluation.correctAnswer')}: {rightAnswer}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setCurrent(0);
                  setResults([]);
                  setSelections([]);
                  setSelected(null);
                  setSubmitted(false);
                }}
                className="rounded-full bg-brown-100 px-6 py-2.5 font-semibold text-brown-800 transition-colors hover:bg-brown-200"
              >
                {t('evaluation.retry')}
              </button>
              <Link
                to="/"
                className="rounded-full bg-brown-800 px-6 py-2.5 font-display font-semibold text-cream shadow transition-transform hover:scale-105"
              >
                {t('evaluation.backHome')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm font-semibold text-brown-500">
              <span>
                {t('evaluation.question', { current: current + 1, total: EVALUATION.length })}
              </span>
              <span>
                {correctCount} ✓
              </span>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-brown-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-peach to-brown-600 transition-all duration-500"
                style={{ width: `${((current + 1) / EVALUATION.length) * 100}%` }}
              />
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brown-200/60 md:p-8">
              <h2 className="font-display text-lg font-bold leading-snug text-brown-800">
                {qText}
              </h2>

              <div className="mt-5 space-y-2.5">
                {qShuffled.map((opt, i) => {
                  let cls = 'bg-white ring-brown-200 hover:ring-brown-400 hover:bg-brown-50';
                  if (submitted) {
                    if (i === correctPos) cls = 'bg-green-100 ring-green-400 text-green-800';
                    else if (i === selected) cls = 'bg-red-50 ring-red-300 text-red-700';
                    else cls = 'bg-white ring-brown-200 opacity-60';
                  } else if (i === selected) {
                    cls = 'bg-brown-50 ring-brown-500';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => !submitted && setSelected(i)}
                      className={`block w-full rounded-2xl px-5 py-3 text-left font-medium text-brown-800 ring-1 transition ${cls}`}
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brown-100 text-xs font-bold text-brown-600">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-5 animate-pop-in">
                  <div
                    className={`rounded-2xl p-4 text-sm font-medium ring-1 ${
                      selected === correctPos
                        ? 'bg-green-100 text-green-800 ring-green-400'
                        : 'bg-red-50 text-red-700 ring-red-300'
                    }`}
                  >
                    <p className="font-display text-base font-bold">
                      {selected === correctPos
                        ? t('evaluation.feedbackCorrect')
                        : t('evaluation.feedbackWrong', { answer: qOptions[q.correct] })}
                    </p>
                    <p className="mt-1.5 leading-relaxed">{qExplain}</p>
                  </div>

                  <button
                    onClick={next}
                    className="mt-5 rounded-full bg-brown-800 px-8 py-2.5 font-display font-semibold text-cream shadow transition-transform hover:scale-105"
                  >
                    {isLast ? t('evaluation.finish') : `${t('evaluation.next')} →`}
                  </button>
                </div>
              )}

              {!submitted && (
                <button
                  onClick={submit}
                  disabled={selected == null || saving}
                  className="mt-6 w-full rounded-full bg-brown-800 py-3 font-display font-semibold text-cream shadow transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40"
                >
                  {saving ? '...' : t('evaluation.submit')}
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
