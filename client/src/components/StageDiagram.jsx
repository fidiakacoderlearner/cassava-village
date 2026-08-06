import { useEffect } from 'react';
import { useI18n } from '../context/I18nContext.jsx';
import AssetImage from './AssetImage.jsx';
import { playReveal } from '../context/AudioContext.jsx';

export function CurvedArrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 transition-transform duration-200 hover:scale-105">
      {label && (
        <span className="rounded-full bg-amber-200/90 px-3 py-1 text-sm font-extrabold text-brown-900 shadow-sm md:text-base">
          {label}
        </span>
      )}
      <svg
        viewBox="0 0 160 56"
        className="h-12 w-24 overflow-visible md:h-16 md:w-40"
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
      className={`flex flex-col items-center rounded-2xl px-4 py-3 transition-all ${
        isCurrent
          ? 'bg-brown-800 text-cream shadow-md scale-105 ring-2 ring-amber-400'
          : 'bg-white/80 text-brown-800 ring-1 ring-brown-200'
      }`}
    >
      <AssetImage
        name={asset}
        alt={label}
        className="h-14 w-14 object-contain drop-shadow-md md:h-20 md:w-20"
        fallback={<span className="text-3xl md:text-4xl">{emoji}</span>}
      />
      <span className="mt-1 text-sm font-extrabold md:text-base">{label}</span>
    </div>
  );
}

function CassavaNode({ inputDetail, big = false }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center min-w-[72px]">
      <AssetImage
        name="cassava"
        alt={t('exploration.cassava')}
        className={`${big ? 'h-24 md:h-32' : 'h-20 md:h-28'} w-auto object-contain drop-shadow-lg`}
        fallback={<span className={`${big ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'} drop-shadow-md`}>🥔</span>}
      />
      <span className="mt-1 rounded-full bg-white px-3 py-1 text-center text-xs font-bold text-brown-800 shadow-sm md:text-sm">
        {t('exploration.cassava')}
        {inputDetail && (
          <span className="block text-[10px] font-semibold text-brown-600 md:text-xs">{inputDetail}</span>
        )}
      </span>
    </div>
  );
}

function MachineNode({ machineId, label, emoji, big = false }) {
  return (
    <div className="flex flex-col items-center min-w-[72px]">
      <AssetImage
        name={machineId}
        alt={label}
        className={`${big ? 'h-24 md:h-32' : 'h-20 md:h-28'} w-auto object-contain drop-shadow-lg`}
        fallback={<span className={`${big ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl'} drop-shadow-md`}>{emoji}</span>}
      />
      <span className="mt-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-brown-800 shadow-sm md:text-sm">
        {label}
      </span>
    </div>
  );
}

export function MachineFlowDiagram({ stepId }) {
  const { t, has } = useI18n();
  const peelLabel = has('story.peeling-machine.label') ? t('story.peeling-machine.label') : 'Peeling Machine';
  const washLabel = has('story.washing-machine.label') ? t('story.washing-machine.label') : 'Washing Machine';
  const inputDetail = stepId === 'quiz-peel' ? 'x = 8,5 kg' : null;

  if (stepId === 'peeling-function' || stepId === 'washing-function') {
    const isPeel = stepId === 'peeling-function';
    return (
      <div className="w-full animate-pop-in">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-5 text-center">
          <CassavaNode big />
          <CurvedArrow label={isPeel ? 'f' : 'g'} />
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
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
        {/* Input Cassava */}
        <CassavaNode inputDetail={inputDetail} />

        {/* Arrow 1: f(x) */}
        <CurvedArrow label="f(x) = 0,85x" />

        {/* Peeling Machine */}
        <MachineNode machineId="peeling-machine" label={peelLabel} emoji="⚙️" />

        {/* Arrow 2: g(x) */}
        <CurvedArrow label="g(x) = 0,9x − 0,5" />

        {/* Washing Machine */}
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
        <div className="flex flex-wrap items-center justify-center gap-1 md:gap-3 text-center">
          {order.map((idx, i) => (
            <div key={flowLabels[idx]} className="flex items-center gap-1 md:gap-3">
              <MoneyCard label={flowLabels[idx]} asset={assets[idx]} emoji={emojis[idx]} isCurrent={activeIndex === idx} />
              {i < order.length - 1 && (
                <CurvedArrow label={i === 0 ? 'f(x) = 0,75x' : 'g(x) = x − 80.000'} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-pop-in">
      <div className="flex flex-wrap items-center justify-center gap-1 md:gap-3 text-center">
        {flowLabels.map((label, index) => {
          const isCurrent = activeIndex === index;
          return (
            <div key={label} className="flex items-center gap-1 md:gap-3">
              <MoneyCard label={label} asset={assets[index]} emoji={emojis[index]} isCurrent={isCurrent} />
              {index < flowLabels.length - 1 && (
                <CurvedArrow
                  label={
                    labels === 'fg'
                      ? index === 0
                        ? 'f(x) = 0,75x'
                        : 'g(x) = x − 80.000'
                      : labels === 'f' && index === 0
                        ? 'f(x) = 0,75x'
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
    <div className="pointer-events-none fixed inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center justify-center gap-3">
      {/* Wrapper containing the warm glow and machine image together */}
      <div className="relative flex items-center justify-center p-2">
        {/* Warm radial glow behind machine */}
        <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-amber-300/50 blur-2xl animate-reveal-grow md:h-56 md:w-56" />

        {/* Machine Asset Image */}
        <AssetImage
          name={machineId}
          alt={label}
          className="relative z-10 h-24 w-auto object-contain animate-reveal-grow drop-shadow-[0_4px_15px_rgba(84,62,39,0.3)] md:h-32 lg:h-36"
          fallback={<span className="relative z-10 text-5xl drop-shadow-md md:text-7xl">{emoji || '⚙️'}</span>}
        />
      </div>

      {/* Label Pill directly below */}
      <span className="rounded-full bg-white/95 px-4 py-1 font-display text-xs font-bold text-brown-800 shadow-md ring-1 ring-brown-200/60 md:text-sm">
        {label}
      </span>
    </div>
  );
}
