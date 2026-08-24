import { useState } from 'react';
import { EVALUATION } from '../../data/evaluation.js';
import MathText from '../MathText.jsx';
import AttemptTabs from './AttemptTabs.jsx';

export default function EvaluationAnswersPanel({ student, t }) {
  const attempts = student?.attempts || [];
  const [active, setActive] = useState(() => Math.max(0, attempts.length - 1));
  const TOTAL_EVAL = EVALUATION.length;
  const EVAL_STEP_IDS = EVALUATION.map((q) => q.id);

  if (attempts.length === 0) {
    return (
      <div className="py-6 text-center text-sm font-semibold text-brown-500">
        {t('teacher.evalNoAttempts')}
      </div>
    );
  }

  const current = attempts[active];
  const correctCount = current.correctCount ?? 0;

  return (
    <div>
      <AttemptTabs
        attempts={attempts}
        t={t}
        attemptLabel="teacher.evalAttempt"
        onChange={setActive}
        activeIndex={active}
      />

      <div className="mt-4 mb-4 rounded-2xl bg-green-100/80 p-4 ring-1 ring-green-300">
        <p className="text-sm font-semibold text-green-800">
          {t('teacher.evalScore', { correct: correctCount, total: TOTAL_EVAL })}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{ width: `${(correctCount / TOTAL_EVAL) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {EVAL_STEP_IDS.map((stepId, i) => {
          const evalData = current.answers[stepId];
          const isCorrect = evalData?.isCorrect === true;
          const answerIndex = evalData?.answerIndex;
          const options = t(`quiz.${stepId}.options`);
          const userAnswer = answerIndex != null && Array.isArray(options) && options[answerIndex]
            ? options[answerIndex]
            : evalData?.answer;
          const correctIdx = EVALUATION.find((q) => q.id === stepId)?.correct ?? 0;
          const correctAnswer = Array.isArray(options) ? options[correctIdx] : '';
          return (
            <div
              key={stepId}
              className={`rounded-2xl p-4 ring-1 ${
                isCorrect ? 'bg-green-50 ring-green-200' : 'bg-red-50 ring-red-200'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-brown-400">
                {t('teacher.evalN', { n: i + 1 })}
              </p>
              <p className="mt-1 font-semibold text-brown-800">
                <MathText text={t(`quiz.${stepId}.text`)} />
              </p>
              <div className="mt-2 text-sm">
                {userAnswer ? (
                  isCorrect ? (
                    <p className="font-semibold text-green-700">
                      ✓ {t('evaluation.yourAnswer')}: <MathText text={userAnswer} />
                    </p>
                  ) : (
                    <>
                      <p className="font-semibold text-red-700">
                        ✗ {t('evaluation.yourAnswer')}: <MathText text={userAnswer} />
                      </p>
                      <p className="mt-1 font-semibold text-green-700">
                        {t('evaluation.correctAnswer')}: <MathText text={correctAnswer} />
                      </p>
                    </>
                  )
                ) : (
                  <p className="italic text-brown-400">{t('teacher.noAnswer')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}