import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import MathText from '../components/MathText.jsx';
import { LogOutIcon } from '../components/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';
import { playTypeBlip, playCorrect, playWrong } from '../context/AudioContext.jsx';
import { STORY, SPEAKERS, OPEN_STEPS } from '../data/story.js';
import { DRAG_CARDS, DRAG_X, DRAG_BEST, DRAG_SUB, EXPERIMENT_ROWS, formatRupiah } from '../data/drag.js';
import QuizOptions from '../components/quiz/QuizOptions.jsx';
import OpenStepInput from '../components/quiz/OpenStepInput.jsx';
import DialogueActions from '../components/quiz/DialogueActions.jsx';
import DragExperimentQuiz from '../components/quiz/DragExperimentQuiz.jsx';
import ExperimentResultTable from '../components/quiz/ExperimentResultTable.jsx';
import ReviewPage from '../components/quiz/ReviewPage.jsx';
import CalcContextBanner from '../components/CalcContextBanner.jsx';

export default function Exploration() {
  const { token, user, api } = useAuth();
  const { t, has } = useI18n();
  const { refresh } = useProgress();
  const navigate = useNavigate();

  const storageKey = `cv_step_${user?.id}`;
  const essayKey = `cv_essays_${user?.id}`;

  const [index, setIndex] = useState(() => {
    const saved = Number(localStorage.getItem(storageKey));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  });
  const [visited, setVisited] = useState(() =>
    new Set(STORY.slice(0, Math.min(index, STORY.length)).map((x) => x.id))
  );
  const [completed, setCompleted] = useState(() =>
    new Set(STORY.slice(0, Math.min(index, STORY.length)).map((x) => x.id))
  );
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
  const dragKey = `cv_drag_answer_${user?.id}`;
  const [dragAnswer, setDragAnswer] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(dragKey));
      return raw && typeof raw.slot1 === 'string' && typeof raw.slot2 === 'string' ? raw : null;
    } catch {
      return null;
    }
  });
  const [savedAnswers, setSavedAnswers] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [typedDone, setTypedDone] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api('/api/answers');
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
      const safeText = (text ?? '').trim() || (prev[stepId]?.text ?? '');
      if (!safeText) return prev;
      const next = { ...prev, [stepId]: { text: safeText, saved: true } };
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

  function saveDragAnswer(data) {
    setDragAnswer(data);
    localStorage.setItem(dragKey, JSON.stringify(data));
  }

  async function saveAnswer(stepId, answer, isCorrect, answerIndex) {
    try {
      await api('/api/answers', {
        method: 'POST',
        body: { stepId, answer, isCorrect, answerIndex },
      });
      if (isCorrect !== false) {
        setSavedAnswers((prev) => ({ ...prev, [stepId]: { answer, is_correct: isCorrect } }));
      }
    } catch {
      /* ignore */
    }
  }

  async function saveReview(values) {
    setSavingReview(true);
    setReviewError('');
    try {
      const answers = {};
      for (const id of OPEN_STEPS) {
        if (values[id] != null) answers[id] = values[id];
      }
      await api('/api/exploration/submit', {
        method: 'POST',
        token,
        body: { answers, drag: dragAnswer },
      });
      localStorage.removeItem(storageKey);
      localStorage.removeItem(essayKey);
      localStorage.removeItem(dragKey);
      navigate('/');
    } catch (err) {
      setReviewError(err?.message === 'Network error' ? t('errors.network') : t('errors.generic'));
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

  const speaker = SPEAKERS[step.speaker] || SPEAKERS['pak-restu'];
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
  }));
  const reviewInitial = {};
  for (const id of OPEN_STEPS) {
    reviewInitial[id] = tempEssays[id]?.text ?? savedAnswers[id]?.answer ?? '';
  }

  return (
    <div className="relative flex h-screen flex-col overflow-y-auto">
      <PageBackground />
      <Navbar />

      <main className="zoom-compensated mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col px-3 pt-3 pb-0 md:px-4 md:pt-4 lg:px-3 lg:pt-3 xl:px-4 xl:pt-4 2xl:px-5">
        {/* Top Exploration Header */}
        <div className="w-full shrink-0">
          <div className="mb-2 flex items-center justify-between gap-2 md:mb-2.5 md:gap-3 lg:mb-2 lg:gap-2 xl:mb-3 xl:gap-4 2xl:mb-4">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-brown-900 drop-shadow-xs md:text-xl lg:text-lg xl:text-2xl 2xl:text-3xl">
                {isReview ? t('exploration.reviewTitle') : t('exploration.title')}
              </h1>
              <p className="flex flex-wrap items-center gap-1 text-[10px] font-semibold text-brown-700 md:gap-1.5 md:text-xs lg:gap-1 lg:text-[10px] xl:gap-2 xl:text-xs 2xl:gap-2.5 2xl:text-sm">
                {isReview
                  ? t('exploration.reviewSubtitle')
                  : t('exploration.step', { current: index + 1, total: STORY.length })}
                {!isReview && (
                  <span className="rounded-full bg-amber-200/80 px-1.5 py-px font-bold text-brown-800 ring-1 ring-amber-300/60 md:px-2 md:py-0.5 lg:px-1.5 lg:py-px xl:px-2.5 xl:py-0.5 2xl:px-3 2xl:py-1">
                    {t('exploration.savedQuestion', { n: savedEssayCount, total: OPEN_STEPS.length })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 md:gap-1.5 lg:gap-1 xl:gap-2 2xl:gap-2.5">
              {index > 0 && (
                <button
                  onClick={back}
                  className="flex items-center gap-0.5 rounded-full bg-brown-500 px-2.5 py-1.5 text-[10px] font-bold text-cream shadow-sm transition-transform hover:scale-105 md:px-3 md:py-1.5 md:text-[10px] lg:px-2.5 lg:py-1 lg:text-[10px] xl:px-4 xl:py-2 xl:text-xs 2xl:px-5 2xl:py-2.5 2xl:text-sm"
                >
                  {t('exploration.back')}
                </button>
              )}
              <button
                onClick={() => setShowExit(true)}
                className="flex items-center gap-1 rounded-full bg-brown-800 px-2.5 py-1.5 text-[10px] font-bold text-cream shadow-md transition-transform hover:scale-105 md:gap-1.5 md:px-3 md:py-1.5 lg:gap-1 lg:px-2.5 lg:py-1 lg:text-[10px] xl:gap-2 xl:px-4 xl:py-2 xl:text-xs 2xl:gap-2.5 2xl:px-5 2xl:py-2.5 2xl:text-sm"
              >
                <LogOutIcon className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
                {t('exit.leave')}
              </button>
            </div>
          </div>
          <ExitModal open={showExit} onClose={() => setShowExit(false)} />

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brown-200/80 shadow-inner md:h-2 lg:h-1.5 xl:h-2 2xl:h-2.5">
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
            error={reviewError}
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
            <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-auto py-2 md:py-3">
              {step.type === 'drag-quiz' ? (
                <div className="w-full overflow-y-auto">
                  <DragExperimentQuiz
                    question={stepText}
                    initialAnswer={dragAnswer}
                    onSave={saveDragAnswer}
                    onContinue={advance}
                  />
                </div>
              ) : step.type === 'experiment-table' ? (
                <div className="max-h-full w-full overflow-y-auto px-1">
                  <ExperimentResultTable answer={dragAnswer} question={t('exploration.dragResult')} onContinue={advance} />
                </div>
              ) : showMachineFlow ? (
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
            {step.type !== 'drag-quiz' && step.type !== 'experiment-table' && (
            <div
              className={`mt-auto flex shrink-0 items-end gap-0 md:gap-0.5 lg:gap-0 xl:gap-1 2xl:gap-1.5 ${
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
                className={`relative mb-2 min-w-0 flex-1 md:mb-3 lg:mb-2 xl:mb-4 ${
                  isRafif ? '-mr-4 md:-mr-6 lg:-mr-5 xl:-mr-6 2xl:-mr-7' : isBoth ? 'mx-0.5 md:mx-1 lg:mx-1 xl:mx-3 2xl:mx-4' : '-ml-4 md:-ml-6 lg:-ml-5 xl:-ml-6 2xl:-ml-7'
                }`}
              >
                {/* Speaker Name Tag pinned on top of dialogue card */}
                <div
                  className={`absolute -top-3 z-10 rounded-full bg-[#f3c599] px-3 py-0.5 shadow-sm ring-1 ring-[#f3c599] md:-top-3.5 md:px-4 md:py-1 lg:-top-3 lg:px-3 lg:py-0.5 xl:-top-4 xl:px-5 xl:py-1.5 2xl:-top-5 2xl:px-6 2xl:py-2 ${
                    isBoth ? 'left-1/2 -translate-x-1/2' : isRafif ? 'right-2.5 md:right-3 lg:right-2.5 xl:right-4 2xl:right-5' : 'left-2.5 md:left-3 lg:left-2.5 xl:left-4 2xl:left-5'
                  }`}
                >
                  <span className="font-display text-sm font-bold text-[#543e27] md:text-base lg:text-sm xl:text-base 2xl:text-lg">
                    {speaker.name}
                  </span>
                </div>

                {/* Dialogue Card */}
                <div className="rounded-3xl bg-[#ffedd8] p-3 pt-4 backdrop-blur-xs shadow-xl ring-1 ring-brown-200/80 md:p-4 md:pt-5 lg:p-3 lg:pt-4 xl:p-5 xl:pt-6">
                  <Typewriter
                    key={step.id}
                    text={stepText}
                    speed={24}
                    instant={visited.has(step.id)}
                    playSound={() => playTypeBlip(620 * pitch)}
                    onDone={() => setTypedDone(true)}
                    skipLabel={t('exploration.skipTyping')}
                    className="text-xs leading-relaxed text-[#543e27] font-medium md:text-sm lg:text-xs xl:text-sm 2xl:text-base"
                  />

                  {step.formula && (
                    <Formula value={step.formula} note={stepFormulaNote} />
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
                    onCorrect={(a, i) => saveAnswer(step.id, a, true, i)}
                    onWrong={(a, i) => saveAnswer(step.id, a, false, i)}
                    onContinue={advance}
                  />
                )}

                {typedDone && step.type === 'open' && (
                  <OpenStepInput
                    key={step.id}
                    step={step}
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
            )}
          </>
        )}
      </main>
    </div>
  );
}