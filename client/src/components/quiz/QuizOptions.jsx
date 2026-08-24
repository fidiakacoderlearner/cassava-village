import { useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import { playTypeBlip, playCorrect, playWrong } from '../../context/AudioContext.jsx';
import MathText from '../MathText.jsx';
import QuizFeedbackModal from '../QuizFeedbackModal.jsx';
import ExplainModal from '../ExplainModal.jsx';

const MAX_ATTEMPTS = 3;

export default function QuizOptions({ step, done, question, answer, explain, onCorrect, onWrong, onContinue }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(done ? 'correct' : 'idle');
  const [attempts, setAttempts] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [fresh, setFresh] = useState(false);

  const correctPos = step.correct;

  function choose(i) {
    if (status === 'correct' || explainOpen) return;
    setSelected(i);
    if (i === correctPos) {
      setStatus('correct');
      setFresh(true);
      playCorrect();
      setModalOpen(true);
      onCorrect(step.options[i]);
    } else {
      setAttempts((a) => a + 1);
      setStatus('wrong');
      playWrong();
      setModalOpen(true);
      onWrong(step.options[i]);
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
    <div className="relative mt-3 w-full animate-pop-in md:mt-3 lg:mt-2 xl:mt-3 2xl:mt-4">
      <div className="mb-2 flex items-center justify-between md:mb-2.5 lg:mb-2 xl:mb-2.5 2xl:mb-3">
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-brown-700 ring-1 ring-brown-200 md:px-2.5 md:py-0.5 md:text-xs lg:px-2 lg:py-0.5 lg:text-[10px] xl:px-3 xl:py-1 xl:text-xs 2xl:px-4 2xl:py-1.5 2xl:text-sm">
          {status === 'correct'
            ? `✓ ${t('exploration.correct')}`
            : t('exploration.attemptsLeft', { n: Math.max(0, MAX_ATTEMPTS - attempts) })}
        </span>
      </div>

      <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 ${status === 'wrong' ? 'animate-shake' : ''}`}>
        {step.options.map((opt, i) => {
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
              className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left font-medium text-brown-900 shadow-xs ring-1 transition active:scale-98 md:gap-2.5 md:px-3.5 md:py-3 lg:gap-2 lg:px-3 lg:py-2.5 xl:gap-3 xl:px-4 xl:py-3.5 2xl:gap-4 2xl:px-5 2xl:py-4 ${cls}`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-xs md:h-6.5 md:w-6.5 md:text-[10px] lg:h-6 lg:w-6 lg:text-[10px] xl:h-7 xl:w-7 xl:text-xs 2xl:h-8 2xl:w-8 2xl:text-sm ${badge}`}>
                {status === 'wrong' && i === selected ? '✗' : String.fromCharCode(65 + i)}
              </span>
              <span className="text-xs font-semibold md:text-sm lg:text-xs xl:text-sm 2xl:text-base"><MathText text={opt} /></span>
            </button>
          );
        })}

        {status === 'correct' && !fresh && (
          <button
            onClick={onContinue}
            className="absolute right-1 bottom-1 z-10 rounded-full bg-brown-800 px-4 py-1.5 font-display text-[10px] font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95 md:px-5 md:py-2 md:text-xs lg:px-4 lg:py-1.5 lg:text-[10px] xl:px-7 xl:py-2.5 xl:text-xs 2xl:px-8 2xl:py-3 2xl:text-sm"
          >
            {t('exploration.continue')}
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