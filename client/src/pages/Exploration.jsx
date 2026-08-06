import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import PageBackground from '../components/PageBackground.jsx';
import Formula from '../components/Formula.jsx';
import Typewriter from '../components/Typewriter.jsx';
import ExitModal from '../components/ExitModal.jsx';
import SpeakerCharacter from '../components/SpeakerCharacter.jsx';
import { MachineFlowDiagram, MoneyFlowDiagram, MachineShowcase } from '../components/StageDiagram.jsx';
import QuizFeedbackModal from '../components/QuizFeedbackModal.jsx';
import ExplainModal from '../components/ExplainModal.jsx';
import { LogOutIcon } from '../components/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { playTypeBlip, playCorrect, playWrong } from '../context/AudioContext.jsx';
import { api } from '../context/api.js';
import { STORY, SPEAKERS, OPEN_STEPS } from '../data/story.js';

function shuffledIndexes(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function QuizOptions({ step, done, question, answer, explain, onCorrect, onWrong, onContinue }) {
  const { t } = useI18n();
  const MAX_ATTEMPTS = 3;
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(done ? 'correct' : 'idle'); // idle | wrong | correct
  const [attempts, setAttempts] = useState(0);
  const [order, setOrder] = useState(() => shuffledIndexes(step.options.length));
  const [modalOpen, setModalOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [fresh, setFresh] = useState(false);

  const shuffled = order.map((o) => step.options[o]);
  const correctPos = order.indexOf(step.correct);

  function choose(i) {
    if (status === 'correct' || explainOpen) return;
    setSelected(i);
    if (i === correctPos) {
      setStatus('correct');
      setFresh(true);
      playCorrect();
      setModalOpen(true);
      onCorrect(shuffled[i]);
    } else {
      setAttempts((a) => a + 1);
      setStatus('wrong');
      playWrong();
      setModalOpen(true);
      onWrong(shuffled[i]);
    }
  }

  function handlePopupTimeout() {
    setModalOpen(false);
    if (status === 'correct' || (status === 'wrong' && attempts >= MAX_ATTEMPTS)) {
      setExplainOpen(true);
    }
  }

  function handleExplainContinue() {
    setExplainOpen(false);
    onContinue();
  }

  return (
    <div className="relative mt-4 w-full animate-pop-in">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brown-700 ring-1 ring-brown-200">
          {status === 'correct'
            ? `✓ ${t('exploration.correct')}`
            : t('exploration.attemptsLeft', { n: Math.max(0, MAX_ATTEMPTS - attempts) })}
        </span>
      </div>

      <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 ${status === 'wrong' ? 'animate-shake' : ''}`}>
        {shuffled.map((opt, i) => {
          let cls = 'bg-white/95 ring-brown-200 hover:ring-amber-500 hover:bg-amber-50/80';
          let badge = 'bg-amber-200 text-brown-900';
          if (status === 'correct' && i === correctPos) {
            cls = 'bg-green-100 ring-2 ring-green-400 text-green-900 font-bold';
            badge = 'bg-green-400 text-white';
          } else if (status === 'wrong' && i === selected) {
            cls = 'bg-pink-100 ring-2 ring-pink-400 text-pink-900 font-bold';
            badge = 'bg-pink-400 text-white';
          }

          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left font-medium text-brown-900 shadow-xs ring-1 transition active:scale-98 ${cls}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${badge}`}>
                {status === 'wrong' && i === selected ? '✗' : String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm font-semibold">{opt}</span>
            </button>
          );
        })}

        {status === 'correct' && !fresh && (
          <button
            onClick={onContinue}
            className="absolute right-1 bottom-1 z-10 rounded-full bg-brown-800 px-7 py-2.5 font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {t('exploration.continue')} →
          </button>
        )}
      </div>

      <QuizFeedbackModal
        open={modalOpen}
        status={status}
        onTimeout={handlePopupTimeout}
      />

      <ExplainModal
        open={explainOpen}
        question={question}
        answer={answer}
        explain={explain}
        onContinue={handleExplainContinue}
      />
    </div>
  );
}

function OpenStepInput({ step, hint, value: initialValue, saved, onDraft, onSave, onUnsave, onContinue }) {
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue || '');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setValue(initialValue || '');
  }, [step.id, initialValue]);

  const canContinue = saved && value.trim().length > 0;

  return (
    <div className="mt-4 w-full animate-pop-in">
      <textarea
        value={value}
        readOnly={saved}
        onChange={(e) => {
          setValue(e.target.value);
          onDraft(step.id, e.target.value);
        }}
        rows={3}
        placeholder={t('exploration.writeAnswer')}
        className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm text-brown-900 placeholder-brown-400 shadow-xs outline-none transition ${
          saved
            ? 'border-green-300 bg-green-50/70'
            : 'border-brown-200 bg-white/95 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
        }`}
      />

      {hint && (
        <div className="mt-2">
          <button
            onClick={() => setShowHint((s) => !s)}
            className="rounded-full bg-peach/80 px-4 py-1.5 text-xs font-bold text-brown-800 shadow-sm ring-1 ring-brown-200/60 transition-colors hover:bg-peach"
          >
            {showHint ? '▲' : '▼'} {t('exploration.hint')}
          </button>
          {showHint && (
            <p className="mt-1.5 rounded-xl bg-amber-100/90 px-3 py-2 text-xs font-medium text-brown-800 shadow-xs">
              {hint}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {saved ? (
          <>
            <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
              ✓ {t('exploration.saved')}
            </span>
            <button
              onClick={onUnsave}
              className="rounded-full bg-brown-200 px-5 py-2.5 font-display font-bold text-brown-800 shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              ✎ {t('exploration.edit')}
            </button>
          </>
        ) : (
          <button
            onClick={() => onSave(value)}
            disabled={!value.trim()}
            className="rounded-full bg-green-600 px-6 py-2.5 font-display font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            ✓ {t('exploration.saveAnswer')}
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="ml-auto rounded-full bg-brown-800 px-7 py-2.5 font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {t('exploration.continue')} →
        </button>
      </div>
    </div>
  );
}

function DialogueActions({ onContinue }) {
  const { t } = useI18n();
  return (
    <div className="mt-3 flex justify-end animate-pop-in">
      <button
        onClick={onContinue}
        className="ml-auto rounded-full bg-brown-800 px-7 py-2.5 font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        {t('exploration.continue')} →
      </button>
    </div>
  );
}

function ReviewPage({ items, initialValues, saving, onSave, onBack }) {
  const { t } = useI18n();
  const [values, setValues] = useState(initialValues);
  const [showHint, setShowHint] = useState({});
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
            <p className="mt-1 text-sm font-semibold leading-relaxed text-brown-900">{it.question}</p>

            <textarea
              value={values[it.id] || ''}
              onChange={(e) => setValues((v) => ({ ...v, [it.id]: e.target.value }))}
              rows={3}
              placeholder={t('exploration.writeAnswer')}
              className="mt-3 w-full resize-none rounded-2xl border border-brown-200 bg-cream px-4 py-3 text-sm text-brown-900 placeholder-brown-400 shadow-xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />

            {it.hint && (
              <div className="mt-2">
                <button
                  onClick={() => setShowHint((s) => ({ ...s, [it.id]: !s[it.id] }))}
                  className="rounded-full bg-peach/80 px-4 py-1.5 text-xs font-bold text-brown-800 shadow-sm ring-1 ring-brown-200/60 transition-colors hover:bg-peach"
                >
                  {showHint[it.id] ? '▲' : '▼'} {t('exploration.hint')}
                </button>
                {showHint[it.id] && (
                  <p className="mt-1.5 rounded-xl bg-amber-100/90 px-3 py-2 text-xs font-medium text-brown-800 shadow-xs">
                    {it.hint}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="rounded-full bg-brown-200 px-5 py-2.5 text-sm font-bold text-brown-800 shadow transition-colors hover:bg-brown-300"
          >
            ← {t('exploration.back')}
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

function CalcContextBanner({ text, pillLabel, prevAnswer }) {
  return (
    <div className="w-full animate-pop-in space-y-2">
      <div className="rounded-2xl bg-[#f3c599]/50 px-4 py-3 text-left text-sm font-medium leading-relaxed text-brown-800 ring-1 ring-peach">
        {text}
      </div>
      {pillLabel && prevAnswer && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/85 px-4 py-2 shadow-sm ring-1 ring-brown-200/70">
          <span className="rounded-full bg-peach px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brown-800">
            {pillLabel}
          </span>
          <span className="min-w-0 text-left text-xs font-semibold text-brown-800">{prevAnswer}</span>
        </div>
      )}
    </div>
  );
}

export default function Exploration() {
  const { token, user } = useAuth();
  const { t, has } = useI18n();
  const { refresh } = useProgress();
  const navigate = useNavigate();

  const storageKey = `cv_step_${user?.id}`;
  const essayKey = `cv_essays_${user?.id}`;

  const [index, setIndex] = useState(() => {
    const saved = Number(localStorage.getItem(storageKey));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  });
  const [visited, setVisited] = useState(() => {
    const saved = Number(localStorage.getItem(storageKey));
    const cur = Number.isFinite(saved) && saved > 0 ? saved : 0;
    return new Set(STORY.slice(0, Math.min(cur, STORY.length)).map((x) => x.id));
  });
  const [completed, setCompleted] = useState(() => {
    const saved = Number(localStorage.getItem(storageKey));
    const cur = Number.isFinite(saved) && saved > 0 ? saved : 0;
    return new Set(STORY.slice(0, Math.min(cur, STORY.length)).map((x) => x.id));
  });
  const [tempEssays, setTempEssays] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(essayKey)) || {};
      const map = {};
      for (const [k, v] of Object.entries(raw)) {
        map[k] = typeof v === 'string' ? { text: v, saved: true } : v;
      }
      return map;
    } catch {
      return {};
    }
  });
  const [savedAnswers, setSavedAnswers] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [typedDone, setTypedDone] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api('/api/answers', { token });
        if (alive) {
          const map = {};
          for (const a of data.answers) {
            if (a.is_correct === 0) continue;
            map[a.step_id] = a;
          }
          setSavedAnswers(map);
        }
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const isReview = index >= STORY.length;
  const step = STORY[Math.min(index, STORY.length - 1)];
  const stepDone = Boolean(savedAnswers[step.id] || completed.has(step.id));

  useEffect(() => {
    if (step) {
      console.log(`[CassavaVillage Debug] Active Step: ${index + 1}/${STORY.length} (ID: "${step.id}", Type: "${step.type}", Machine: "${step.machineId || 'none'}")`);
    }
  }, [index, step]);

  useEffect(() => {
    setTypedDone(visited.has(step.id));
  }, [step.id, visited]);

  const savedEssayCount = useMemo(() => {
    return OPEN_STEPS.filter((id) => Boolean(tempEssays[id]?.saved)).length;
  }, [tempEssays]);

  const storyBase = `story.${step.i18n}`;
  const stepText = t(`${storyBase}.text`);
  const stepExplain = has(`${storyBase}.explain`) ? t(`${storyBase}.explain`) : null;
  const stepHint = has(`${storyBase}.hint`) ? t(`${storyBase}.hint`) : null;
  const stepLabel = has(`${storyBase}.label`) ? t(`${storyBase}.label`) : null;
  const stepFormulaNote = has(`${storyBase}.formulaNote`) ? t(`${storyBase}.formulaNote`) : null;

  function advance() {
    setVisited((v) => {
      const next = new Set(v);
      next.add(step.id);
      return next;
    });
    setCompleted((c) => {
      const next = new Set(c);
      next.add(step.id);
      return next;
    });
    const next = index >= STORY.length - 1 ? STORY.length : index + 1;
    localStorage.setItem(storageKey, String(next));
    setIndex(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    setVisited((v) => {
      const next = new Set(v);
      next.add(step.id);
      return next;
    });
    const next = Math.max(0, index - 1);
    localStorage.setItem(storageKey, String(next));
    setIndex(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function saveEssayDraft(stepId, text) {
    setTempEssays((prev) => {
      const next = { ...prev, [stepId]: { text, saved: prev[stepId]?.saved ?? false } };
      localStorage.setItem(essayKey, JSON.stringify(next));
      return next;
    });
  }

  function saveEssay(stepId, text) {
    setTempEssays((prev) => {
      const next = { ...prev, [stepId]: { text: text ?? prev[stepId]?.text ?? '', saved: true } };
      localStorage.setItem(essayKey, JSON.stringify(next));
      return next;
    });
  }

  function unsaveEssay(stepId) {
    setTempEssays((prev) => {
      const next = { ...prev, [stepId]: { text: prev[stepId]?.text ?? '', saved: false } };
      localStorage.setItem(essayKey, JSON.stringify(next));
      return next;
    });
  }

  async function saveAnswer(stepId, answer, isCorrect = null) {
    await api('/api/answers', {
      method: 'POST',
      token,
      body: { stepId, answer, isCorrect },
    });
    if (isCorrect !== false) {
      setSavedAnswers((prev) => ({ ...prev, [stepId]: { answer, is_correct: isCorrect } }));
    }
  }

  async function saveReview(values) {
    setSavingReview(true);
    try {
      await api('/api/exploration/submit', {
        method: 'POST',
        token,
        body: { answers: values },
      });
      localStorage.removeItem(essayKey);
      localStorage.removeItem(storageKey);
      setTempEssays({});
      refresh();
      navigate('/');
    } catch {
      /* ignore */
    } finally {
      setSavingReview(false);
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-full">
        <PageBackground />
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brown-200 border-t-brown-800" />
        </div>
      </div>
    );
  }

  const speaker = SPEAKERS[step.speaker] || SPEAKERS.narrator;
  const pitch = speaker.pitch ?? 1;
  const isRafif = step.speaker === 'pak-rafif';
  const isBoth = step.speaker === 'both';
  const isMoneyReverse = ['rafif-story', 'open-fog-money'].includes(step.id);

  // Determine which diagram to display in stage center
  const showMachineFlow =
    step.id === 'machine-flow' ||
    step.id === 'peeling-function' ||
    step.id === 'washing-function' ||
    step.id === 'quiz-peel' ||
    step.id === 'quiz-wash' ||
    step.id === 'composition-explanation' ||
    step.id === 'open-gof-machines';

  const moneyFlowLabels =
    step.id === 'quiz-retribution'
      ? 'f'
      : ['open-gof-money', 'rafif-intro', 'rafif-story', 'open-fog-money'].includes(step.id)
        ? 'fg'
        : 'none';

  const reviewItems = OPEN_STEPS.map((id) => ({
    id,
    question: t(`story.${id}.text`),
    hint: has(`story.${id}.hint`) ? t(`story.${id}.hint`) : null,
  }));
  const reviewInitial = {};
  for (const id of OPEN_STEPS) {
    reviewInitial[id] = tempEssays[id]?.text ?? savedAnswers[id]?.answer ?? '';
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <PageBackground />
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col px-4 pt-4 pb-0 md:pt-6">
        {/* Top Exploration Header */}
        <div className="w-full shrink-0">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-brown-900 drop-shadow-xs">
                {isReview ? t('exploration.reviewTitle') : t('exploration.title')}
              </h1>
              <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brown-700">
                {isReview
                  ? t('exploration.reviewSubtitle')
                  : t('exploration.step', { current: index + 1, total: STORY.length })}
                {!isReview && (
                  <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 font-bold text-brown-800 ring-1 ring-amber-300/60">
                    {t('exploration.savedQuestion', { n: savedEssayCount, total: OPEN_STEPS.length })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  onClick={back}
                  className="flex items-center gap-1 rounded-full bg-brown-500 px-4 py-2 text-xs font-bold text-cream shadow-sm transition-transform hover:scale-105"
                >
                  ← {t('exploration.back')}
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

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-brown-200/80 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-brown-700 transition-all duration-500"
              style={{ width: `${isReview ? 100 : ((index + 1) / STORY.length) * 100}%` }}
            />
          </div>
        </div>

        {isReview ? (
          <ReviewPage
            items={reviewItems}
            initialValues={reviewInitial}
            saving={savingReview}
            onSave={saveReview}
            onBack={back}
          />
        ) : (
          <>
            {/* Context Banner (step 19-20) below the Exploration header */}
            {step.contextBanner && (
              <div className="w-full shrink-0 pt-2 pb-1 md:pt-4 md:pb-2">
                <CalcContextBanner
                  text={t('exploration.calcBanner')}
                  pillLabel={
                    step.previousEssayKey
                      ? t('exploration.previousAnswerPill', { n: step.essayNumberLabel ?? step.previousEssayKey })
                      : null
                  }
                  prevAnswer={
                    step.previousEssayKey
                      ? tempEssays[step.previousEssayKey]?.text ??
                        savedAnswers[step.previousEssayKey]?.answer ??
                        null
                      : null
                  }
                />
              </div>
            )}

            {/* Center Stage Area */}
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden py-2 md:py-3">
              {showMachineFlow ? (
                <MachineFlowDiagram stepId={step.id} />
              ) : step.moneyFlow != null ? (
                <MoneyFlowDiagram activeIndex={step.moneyFlow} labels={moneyFlowLabels} reverse={isMoneyReverse} />
              ) : step.machineId ? (
                <MachineShowcase machineId={step.machineId} label={stepLabel} emoji={step.emoji} />
              ) : (
                <div className="hidden md:block h-8" />
              )}
            </div>

            {/* Bottom Speaker & Dialogue Box Area */}
            <div
              className={`mt-auto flex shrink-0 items-end gap-0 md:gap-1 ${
                isBoth ? 'justify-center' : ''
              } ${isRafif ? 'flex-row-reverse' : ''}`}
            >
              {isBoth && (
                <div className="hidden shrink-0 md:block">
                  <SpeakerCharacter speakerId="pak-restu" speaker={SPEAKERS['pak-restu']} />
                </div>
              )}
              {!isBoth && <SpeakerCharacter speakerId={step.speaker} speaker={speaker} />}

              {/* Right Column (Left when Rafif; Centered when Both): Dialogue Card + Interactive Options Below */}
              <div
                className={`relative mb-4 min-w-0 flex-1 md:mb-6 ${
                  isRafif ? '-mr-6 md:-mr-10' : isBoth ? 'mx-1 md:mx-3' : '-ml-6 md:-ml-10'
                }`}
              >
                {/* Speaker Name Tag pinned on top of dialogue card */}
                <div
                  className={`absolute -top-4 z-10 rounded-full bg-[#f3c599] px-5 py-1.5 shadow-sm ring-1 ring-[#f3c599] ${
                    isBoth ? 'left-1/2 -translate-x-1/2' : isRafif ? 'right-4' : 'left-4'
                  }`}
                >
                  <span className="font-display text-base font-bold text-[#543e27] md:text-lg">
                    {speaker.name}
                  </span>
                </div>

                {/* Dialogue Card */}
                <div className="rounded-3xl bg-[#ffedd8] p-5 pt-6 backdrop-blur-xs shadow-xl ring-1 ring-brown-200/80 md:p-6 md:pt-7">
                  <Typewriter
                    key={step.id}
                    text={stepText}
                    speed={24}
                    instant={visited.has(step.id)}
                    playSound={() => playTypeBlip(620 * pitch)}
                    onDone={() => setTypedDone(true)}
                    skipLabel={t('exploration.skipTyping')}
                    className="text-sm md:text-base leading-relaxed text-[#543e27] font-medium"
                  />
                  {step.formula && (
                    <Formula value={step.formula} note={stepFormulaNote} size="md" />
                  )}
                </div>

                {/* Interactive element BELOW dialogue box */}
                {typedDone && step.type === 'quiz' && (
                  <QuizOptions
                    key={step.id}
                    step={step}
                    done={stepDone}
                    question={stepText}
                    answer={step.options[step.correct]}
                    explain={stepExplain}
                    onCorrect={(a) => saveAnswer(step.id, a, true)}
                    onWrong={(a) => saveAnswer(step.id, a, false)}
                    onContinue={advance}
                  />
                )}

                {typedDone && step.type === 'open' && (
                  <OpenStepInput
                    key={step.id}
                    step={step}
                    hint={stepHint}
                    value={tempEssays[step.id]?.text ?? savedAnswers[step.id]?.answer ?? ''}
                    saved={Boolean(tempEssays[step.id]?.saved ?? savedAnswers[step.id])}
                    onDraft={saveEssayDraft}
                    onSave={(text) => saveEssay(step.id, text)}
                    onUnsave={() => unsaveEssay(step.id)}
                    onContinue={advance}
                  />
                )}

                {typedDone && step.type === 'dialogue' && (
                  <DialogueActions onContinue={advance} />
                )}
              </div>

              {isBoth && (
                <div className="hidden shrink-0 md:block">
                  <SpeakerCharacter speakerId="pak-rafif" speaker={SPEAKERS['pak-rafif']} />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
