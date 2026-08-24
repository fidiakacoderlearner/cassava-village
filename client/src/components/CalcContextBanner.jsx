import MathText from './MathText.jsx';

export default function CalcContextBanner({ text, pillLabel, prevAnswer }) {
  return (
    <div className="w-full animate-pop-in space-y-2">
      <div className="rounded-2xl bg-[#f3c599]/50 px-4 py-3 text-left text-sm font-medium leading-relaxed text-brown-800 ring-1 ring-peach">
        <MathText text={text} />
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