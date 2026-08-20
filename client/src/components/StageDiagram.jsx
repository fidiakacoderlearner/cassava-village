import { useEffect } from 'react';
import { useI18n } from '../context/I18nContext.jsx';
import AssetImage from './AssetImage.jsx';
import MathText from './MathText.jsx';
import { playReveal } from '../context/AudioContext.jsx';

function CurvedArrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 transition-transform duration-200 hover:scale-105">
      {label && (
        <span className="rounded-full bg-amber-200/90 px-1.5 py-px text-[10px] font-extrabold text-brown-900 shadow-sm sm:px-2 sm:py-0.5 sm:text-xs md:text-sm lg:text-sm lg:px-2 lg:py-0.5 xl:px-3 xl:py-1 xl:text-base 2xl:px-4 2xl:py-1.5 2xl:text-lg">
          <MathText text={label} />
        </span>
      )}
      <svg
        viewBox="0 0 160 56"
        className="h-6 w-12 overflow-visible sm:h-8 sm:w-16 md:h-10 md:w-20 lg:h-10 lg:w-20 xl:h-12 xl:w-24 2xl:h-14 2xl:w-28"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 48 C 60 50, 112 38, 148 14"
          stroke="#543e27"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M136.9 15.4 L148 14 L142.5 23.7"
          stroke="#543e27"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

function MoneyCard({ label, asset, emoji, isCurrent }) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl px-1.5 py-1 transition-all sm:px-2 sm:py-1.5 md:px-2.5 md:py-2 lg:px-2 lg:py-1.5 xl:px-3 xl:py-2.5 2xl:px-4 2xl:py-3 ${
        isCurrent
          ? 'bg-brown-800 text-cream shadow-md scale-105 ring-2 ring-amber-400'
          : 'bg-white/80 text-brown-800 ring-1 ring-brown-200'
      }`}
    >
      <AssetImage
        name={asset}
        alt={label}
        className="h-8 w-8 object-contain drop-shadow-md sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-12 lg:w-12 xl:h-14 xl:w-14 2xl:h-16 2xl:w-16"
        fallback={<span className="text-base sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl">{emoji}</span>}
      />
      <span className="mt-0.5 text-[10px] font-extrabold sm:text-xs md:text-sm lg:text-xs xl:text-base 2xl:text-lg"><MathText text={label} /></span>
    </div>
  );
}

function CassavaNode({ inputDetail, big = false }) {
  const { t } = useI18n();
  const sizeCls = big
    ? 'h-14 sm:h-16 md:h-20 lg:h-22 xl:h-24 2xl:h-28'
    : 'h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 2xl:h-24';
  const emojiCls = big
    ? 'text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-7xl'
    : 'text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl';
  return (
    <div className="flex flex-col items-center min-w-[48px] md:min-w-[56px] xl:min-w-[64px] 2xl:min-w-[72px]">
      <AssetImage
        name="cassava"
        alt={t('exploration.cassava')}
        className={`${sizeCls} w-auto object-contain drop-shadow-lg`}
        fallback={<span className={`${emojiCls} drop-shadow-md`}>🥔</span>}
      />
      <span className="mt-0.5 rounded-full bg-white px-1.5 py-px text-center text-[9px] font-bold text-brown-800 shadow-sm sm:px-2 sm:py-0.5 sm:text-[10px] md:text-xs lg:text-[10px] xl:text-sm 2xl:text-base">
        {t('exploration.cassava')}
        {inputDetail && (
          <span className="block text-[8px] font-semibold text-brown-600 sm:text-[9px] md:text-[10px] lg:text-[9px] xl:text-xs 2xl:text-sm"><MathText text={inputDetail} /></span>
        )}
      </span>
    </div>
  );
}

function MachineNode({ machineId, label, emoji, big = false }) {
  const sizeCls = big
    ? 'h-14 sm:h-16 md:h-20 lg:h-22 xl:h-24 2xl:h-28'
    : 'h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 2xl:h-24';
  const emojiCls = big
    ? 'text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-7xl'
    : 'text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl';
  return (
    <div className="flex flex-col items-center min-w-[48px] md:min-w-[56px] xl:min-w-[64px] 2xl:min-w-[72px]">
      <AssetImage
        name={machineId}
        alt={label}
        className={`${sizeCls} w-auto object-contain drop-shadow-lg`}
        fallback={<span className={`${emojiCls} drop-shadow-md`}>{emoji}</span>}
      />
      <span className="mt-0.5 rounded-full bg-white px-1.5 py-px text-[9px] font-bold text-brown-800 shadow-sm sm:px-2 sm:py-0.5 sm:text-[10px] md:text-xs lg:text-[10px] xl:text-sm 2xl:text-base">
        {label}
      </span>
    </div>
  );
}

export function MachineFlowDiagram({ stepId }) {
  const { t, has } = useI18n();
  const peelLabel = has('story.peeling-machine.label') ? t('story.peeling-machine.label') : 'Peeling Machine';
  const washLabel = has('story.washing-machine.label') ? t('story.washing-machine.label') : 'Washing Machine';
  const inputDetail = stepId === 'quiz-peel' ? '<i>x</i> = 8,5 kg' : null;

  if (stepId === 'peeling-function' || stepId === 'washing-function') {
    const isPeel = stepId === 'peeling-function';
    return (
      <div className="w-full animate-pop-in">
        <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 md:gap-2 lg:gap-2 xl:gap-3 2xl:gap-4 text-center">
          <CassavaNode big />
          <CurvedArrow label={isPeel ? '<i>f</i>' : '<i>g</i>'} />
          <MachineNode
            machineId={isPeel ? 'peeling-machine' : 'washing-machine'}
            label={isPeel ? peelLabel : washLabel}
            emoji={isPeel ? '⚙️' : '🫧'}
            big
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-pop-in">
      <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 md:gap-2 lg:gap-2 xl:gap-3 2xl:gap-4 text-center">
        <CassavaNode inputDetail={inputDetail} />
        <CurvedArrow label="<i>f(x)</i> = 0,85<i>x</i>" />
        <MachineNode machineId="peeling-machine" label={peelLabel} emoji="⚙️" />
        <CurvedArrow label="<i>g(x)</i> = 0,9<i>x</i> − 0,5" />
        <MachineNode machineId="washing-machine" label={washLabel} emoji="🫧" />
      </div>
    </div>
  );
}

export function MoneyFlowDiagram({ activeIndex = 0, labels = 'none', reverse = false }) {
  const { t } = useI18n();
  const flowLabels = t('money.flow');
  const assets = ['money-gross', 'money-discount', 'money-retribution'];
  const emojis = ['💰', '💸', '🧾'];

  if (reverse) {
    const order = [0, 2, 1];
    return (
      <div className="w-full animate-pop-in">
        <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-1.5 xl:gap-2 2xl:gap-3 text-center">
          {order.map((idx, i) => (
            <div key={flowLabels[idx]} className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-1.5 xl:gap-2 2xl:gap-3">
              <MoneyCard label={flowLabels[idx]} asset={assets[idx]} emoji={emojis[idx]} isCurrent={activeIndex === idx} />
              {i < order.length - 1 && (
                <CurvedArrow label={i === 0 ? '<i>f(x)</i> = 0,75<i>x</i>' : '<i>g(x)</i> = <i>x</i> − 80.000'} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-pop-in">
      <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-1.5 xl:gap-2 2xl:gap-3 text-center">
        {flowLabels.map((label, index) => {
          const isCurrent = activeIndex === index;
          return (
            <div key={label} className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-1.5 xl:gap-2 2xl:gap-3">
              <MoneyCard label={label} asset={assets[index]} emoji={emojis[index]} isCurrent={isCurrent} />
              {index < flowLabels.length - 1 && (
                <CurvedArrow
                  label={
                    labels === 'fg'
                      ? index === 0
                        ? '<i>f(x)</i> = 0,75<i>x</i>'
                        : '<i>g(x)</i> = <i>x</i> − 80.000'
                      : labels === 'f' && index === 0
                        ? '<i>f(x)</i> = 0,75<i>x</i>'
                        : null
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MachineShowcase({ machineId, label, emoji }) {
  useEffect(() => {
    console.log(`[CassavaVillage Debug] Rendering MachineShowcase: machineId="${machineId}", label="${label}"`);
    playReveal();
  }, [machineId, label]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-2 xl:gap-3 2xl:gap-4">
      <div className="relative flex items-center justify-center p-0.5 sm:p-1 md:p-1.5 lg:p-1 xl:p-2 2xl:p-2.5">
        <div className="pointer-events-none absolute h-20 w-20 rounded-full bg-amber-300/50 blur-2xl animate-reveal-grow sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-32 lg:w-32 xl:h-40 xl:w-40 2xl:h-44 2xl:w-44" />
        <AssetImage
          name={machineId}
          alt={label}
          className="relative z-10 h-12 w-auto object-contain animate-reveal-grow drop-shadow-[0_4px_15px_rgba(84,62,39,0.3)] sm:h-16 md:h-20 lg:h-20 xl:h-24 2xl:h-28"
          fallback={<span className="relative z-10 text-3xl drop-shadow-md sm:text-4xl md:text-5xl lg:text-5xl xl:text-7xl 2xl:text-7xl">{emoji || '⚙️'}</span>}
        />
      </div>
      <span className="rounded-full bg-white/95 px-2 py-px font-display text-[9px] font-bold text-brown-800 shadow-md ring-1 ring-brown-200/60 sm:px-2.5 sm:py-0.5 sm:text-[10px] md:text-xs lg:text-xs xl:text-sm 2xl:text-base">
        {label}
      </span>
    </div>
  );
}
