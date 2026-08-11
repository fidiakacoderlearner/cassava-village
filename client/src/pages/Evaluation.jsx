import { useState } from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import PageBackground from '../components/PageBackground.jsx';
import ExitModal from '../components/ExitModal.jsx';
import { TrophyIcon, LogOutIcon } from '../components/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
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
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const evalKey = `cv_eval_${user?.id}`;

  const [savedState] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(`cv_eval_${user?.id}`));
      if (
        raw &&
        Array.isArray(raw.orders) &&
        raw.orders.length === EVALUATION.length &&
        Array.isArray(raw.answers) &&
        raw.answers.length === EVALUATION.length
      ) {
        return raw;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  const [current, setCurrent] = useState(() => {
    if (savedState) {
      const idx = savedState.answers.findIndex((a) => a == null);
      return idx === -1 ? 0 : idx;
    }
    return 0;
  });

  const [orders, setOrders] = useState(() =>
    savedState
      ? savedState.orders
      : EVALUATION.map((q) => {
          const optsLen = t(`quiz.${q.id}.options`).length;
          return shuffledIndexes(optsLen);
        })
  );
  const [answers, setAnswers] = useState(() =>
    savedState ? savedState.answers : Array(EVALUATION.length).fill(null)
  );

  const total = EVALUATION.length;
  const isLast = current === total - 1;
  const q = EVALUATION[current];
  const qBase = `quiz.${q.id}`;
  const qText = t(`${qBase}.text`);
  const qOptions = t(`${qBase}.options`);
  const qOrder = orders[current] || [];
  const qShuffled = qOrder.map((o) => qOptions[o]);
  const selected = answers[current];

  const isCorrectAnswer = (i) => answers[i] === orders[i].indexOf(EVALUATION[i].correct);
  const correctCount = submitted
    ? EVALUATION.map((_, i) => (isCorrectAnswer(i) ? 1 : 0)).reduce((a, b) => a + b, 0)
    : 0;

  const summaryKey =
    correctCount === total
      ? 'summaryPerfect'
      : correctCount === total - 1
        ? 'summaryGood'
        : correctCount >= Math.ceil(total / 2)
          ? 'summaryFair'
          : 'summaryLow';

  function persist(next) {
    try {
      localStorage.setItem(evalKey, JSON.stringify({ orders, answers: next }));
    } catch {
      /* ignore */
    }
  }

  function select(i) {
    if (submitted || saving) return;
    setSubmitError('');
    const next = answers.map((v, idx) => (idx === current ? i : v));
    setAnswers(next);
    persist(next);
  }

  function goNext() {
    if (isLast) return;
    setSubmitError('');
    setCurrent((c) => c + 1);
  }

  function goBack() {
    if (current === 0) return;
    setSubmitError('');
    setCurrent((c) => c - 1);
  }

  async function submit() {
    if (saving || submitted) return;
    const firstUnanswered = answers.findIndex((a) => a === null);
    if (firstUnanswered !== -1) {
      setCurrent(firstUnanswered);
      return;
    }
    setSaving(true);
    const entries = [];
    for (let i = 0; i < total; i += 1) {
      const ev = EVALUATION[i];
      const chosen = answers[i];
      entries.push({
        stepId: ev.id,
        answer: qShuffledFor(i)[chosen],
        isCorrect: chosen === orders[i].indexOf(ev.correct),
      });
    }
    try {
      await api('/api/evaluation/submit', {
        method: 'POST',
        token,
        body: { answers: entries },
      });
      localStorage.removeItem(evalKey);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message === 'Network error' ? t('errors.network') : t('errors.generic'));
    } finally {
      setSaving(false);
    }
  }

  function qShuffledFor(i) {
    const ev = EVALUATION[i];
    const order = orders[i] || [];
    const opts = t(`quiz.${ev.id}.options`);
    return order.map((o) => opts[o]);
  }

  function retry() {
    setCurrent(0);
    setAnswers(Array(total).fill(null));
    setSubmitted(false);
    setSaving(false);
    setSubmitError('');
    try {
      localStorage.removeItem(evalKey);
    } catch {
      /* ignore */
    }
  }

  function confirmRestart() {
    setShowRestart(false);
    setSubmitError('');
    setCurrent(0);
    setAnswers(Array(total).fill(null));
    setOrders(
      EVALUATION.map((q) => {
        const optsLen = t(`quiz.${q.id}.options`).length;
        return shuffledIndexes(optsLen);
      })
    );
    try {
      localStorage.removeItem(evalKey);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-full">
      <PageBackground />
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-4 pb-10 md:pt-6">
        {!submitted && (
          <div className="w-full shrink-0">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-brown-900 drop-shadow-xs">
                  {t('evaluation.title')}
                </h1>
                <p className="text-xs font-semibold text-brown-700">
                  {t('evaluation.question', { current: current + 1, total })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!submitted && answers.some((a) => a != null) && (
                  <button
                    onClick={() => setShowRestart(true)}
                    className="rounded-full bg-brown-200 px-4 py-2 text-xs font-bold text-brown-800 shadow-sm transition-transform hover:scale-105"
                  >
                    {t('evaluation.restart')}
                  </button>
                )}
                <button
                  onClick={() => setShowExit(true)}
                  className="flex items-center gap-2 rounded-full bg-brown-800 px-4 py-2 text-xs font-bold text-cream shadow-md transition-transform hover:scale-105"
                >
                  <LogOutIcon className="h-4 w-4" />
                  {t('exit.leave')}
                </button>
              </div>
            </div>
            <ExitModal open={showExit} onClose={() => setShowExit(false)} />

            {showRestart && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-brown-900/60 backdrop-blur-sm"
                  aria-hidden="true"
                  onClick={() => setShowRestart(false)}
                />
                <div className="relative w-full max-w-md animate-pop-in rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-brown-200">
                  <h2 className="font-display text-xl font-bold text-brown-800">
                    {t('evaluation.restartTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-brown-600">
                    {t('evaluation.restartMessage')}
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      onClick={() => setShowRestart(false)}
                      className="rounded-full bg-brown-100 px-6 py-2.5 font-semibold text-brown-800 transition-colors hover:bg-brown-200"
                    >
                      {t('exit.stay')}
                    </button>
                    <button
                      onClick={confirmRestart}
                      className="rounded-full bg-brown-800 px-6 py-2.5 font-display font-semibold text-cream shadow transition-transform hover:scale-105"
                    >
                      {t('evaluation.restartConfirm')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="h-2 w-full overflow-hidden rounded-full bg-brown-200/80 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-brown-700 transition-all duration-500"
                style={{ width: `${((current + 1) / total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {submitted ? (
          <div className="animate-pop-in rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-brown-200/60">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sand to-peach text-brown-700">
              <TrophyIcon className="h-10 w-10" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-brown-800">
              {t('evaluation.yourScore')}
            </h2>
            <p className="mt-2 text-5xl font-bold text-brown-700">
              {t('evaluation.outOf', { score: correctCount, total })}
            </p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-brown-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-peach to-brown-600 transition-all duration-700"
                style={{ width: `${(correctCount / total) * 100}%` }}
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
                const isRight = isCorrectAnswer(i);
                const chosen = answers[i];
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
                onClick={retry}
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
            {submitError && (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
                {submitError}
              </div>
            )}
            <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brown-200/60 md:p-8">
              <h2 className="font-display text-lg font-bold leading-snug text-brown-800">
                {qText}
              </h2>

              <div className="mt-5 space-y-2.5">
                {qShuffled.map((opt, i) => {
                  let cls = 'bg-white ring-brown-200 hover:ring-brown-400 hover:bg-brown-50';
                  if (i === selected) {
                    cls = 'bg-brown-50 ring-brown-500';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => select(i)}
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                {current > 0 && (
                  <button
                    onClick={goBack}
                    className="rounded-full bg-brown-200 px-5 py-2.5 text-sm font-bold text-brown-800 shadow transition-colors hover:bg-brown-300"
                  >
                    {t('evaluation.back')}
                  </button>
                )}
                {isLast ? (
                  <button
                    onClick={submit}
                    disabled={saving || answers.some((a) => a === null)}
                    className="ml-auto rounded-full bg-green-600 px-8 py-2.5 font-display font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                  >
                    {saving ? '...' : t('evaluation.submit')}
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="ml-auto rounded-full bg-brown-800 px-8 py-2.5 font-display font-semibold text-cream shadow transition-transform hover:scale-105"
                  >
                    {t('evaluation.next')}
                  </button>
                )}
              </div>

              {answers.some((a) => a === null) && !isLast && (
                <p className="mt-3 text-center text-xs font-semibold text-amber-600">
                  {t('evaluation.allAnswered')}
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}