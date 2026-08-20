import MathText from './MathText.jsx';

export default function Formula({ value, note }) {
  return (
    <div className="flex flex-col items-center gap-1 my-1 sm:gap-2">
      <div className="w-fit rounded-2xl bg-sand/70 px-3 py-1.5 font-display text-base font-semibold text-brown-800 shadow-sm ring-1 ring-brown-200 sm:px-4 sm:py-2 sm:text-lg md:px-5 md:py-3 md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
        <MathText text={value} />
      </div>
      {note && <p className="text-center text-xs text-brown-600 italic sm:text-sm"><MathText text={note} /></p>}
    </div>
  );
}
