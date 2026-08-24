import { useI18n } from '../../context/I18nContext.jsx';
import MathText from '../MathText.jsx';
import { DRAG_SUB, DRAG_BEST, EXPERIMENT_ROWS, formatRupiah } from '../../data/drag.js';

export default function ExperimentResultTable({ answer, question, onContinue }) {
  const { t } = useI18n();
  const hasAnswer = Boolean(
    answer && answer.slot1 && answer.slot2 && DRAG_SUB[answer.slot1] && DRAG_SUB[answer.slot2]
  );
  const myCombo = hasAnswer ? `(${DRAG_SUB[answer.slot2]} ∘ ${DRAG_SUB[answer.slot1]})(<i>x</i>)` : null;
  const result = hasAnswer ? Number(answer.result) : null;

  let feedbackKey = null;
  if (result != null && Number.isFinite(result)) {
    if (result < 900000) feedbackKey = 'dragFeedbackLow';
    else if (result < DRAG_BEST) feedbackKey = 'dragFeedbackMid';
    else feedbackKey = 'dragFeedbackBest';
  }

  return (
    <div className="w-full rounded-3xl bg-peach-light/90 p-5 shadow-xl ring-1 ring-brown-200/60 animate-pop-in md:p-7">
      {question && (
        <h3 className="mb-4 text-left font-display text-base font-bold text-brown-800 md:text-lg leading-relaxed">
          <MathText text={question} />
        </h3>
      )}

      <div className="md:grid md:grid-cols-2 md:items-start md:gap-6">
        {/* Kiri: feedback + penjelasan */}
        <div>
          <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-brown-200/60">
            <p className="text-sm leading-relaxed text-brown-800">
              <MathText text={feedbackKey ? t(`exploration.${feedbackKey}`) : t('exploration.dragNoAnswer')} />
            </p>
            {hasAnswer && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-cream/80 px-3 py-2 text-xs font-semibold text-brown-700 ring-1 ring-brown-200/60">
                <span>{t('exploration.dragYourAnswer')}:</span>
                <span className="font-mono"><MathText text={myCombo} /></span>
                <span className="font-bold text-brown-900">= {formatRupiah(result)}</span>
                {result === DRAG_BEST && (
                  <span className="rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    🏆 {t('exploration.experimentBest')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Kanan: tabel hasil eksperimen */}
        <div className="mt-4 overflow-hidden rounded-2xl shadow-md ring-1 ring-brown-200/70 md:mt-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-brown-800 text-cream">
                <th className="px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wide">
                  {t('exploration.experimentCombo')}
                </th>
                <th className="px-4 py-2.5 text-right font-display text-xs font-bold uppercase tracking-wide">
                  {t('exploration.experimentResult')}
                </th>
              </tr>
            </thead>
            <tbody>
              {EXPERIMENT_ROWS.map((r) => {
                const isBest = r.best;
                const isYour = hasAnswer && r.combo === myCombo;
                return (
                  <tr
                    key={r.combo}
                    className={`border-t border-brown-100 ${isBest ? 'bg-green-100/80' : isYour ? 'bg-amber-100/90' : 'bg-white/85'}`}
                  >
                    <td className="px-4 py-2 font-mono text-xs font-semibold text-brown-800">
                      {isYour && (
                        <span className="mr-2 text-[10px] font-bold uppercase text-amber-600">
                          {t('exploration.dragYourAnswer')}
                        </span>
                      )}
                      <MathText text={r.combo} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={`inline-flex flex-wrap items-center justify-end gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isBest ? 'bg-green-500 text-white' : 'text-brown-700'
                        }`}
                      >
                        {r.value}
                        {isYour && (
                          <span className="rounded-full bg-amber-400 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-brown-900">
                            {t('exploration.dragYourAnswer')}
                          </span>
                        )}
                        {isBest && <span>🏆</span>}
                        {isBest && (
                          <span className="font-display text-[9px] uppercase tracking-widest">
                            {t('exploration.experimentBest')}
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={onContinue}
          className="ml-auto rounded-full bg-brown-800 px-7 py-2.5 font-display font-bold text-cream shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          {t('exploration.nextReview')}
        </button>
      </div>
    </div>
  );
}