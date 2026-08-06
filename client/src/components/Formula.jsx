export default function Formula({ value, note, size = 'md' }) {
  const sizes = {
    md: 'text-xl md:text-2xl px-5 py-3',
    lg: 'text-2xl md:text-3xl px-6 py-4',
  };
  return (
    <div className="flex flex-col items-center gap-2 my-1">
      <div
        className={`${sizes[size]} w-fit rounded-2xl bg-sand/70 font-display font-semibold text-brown-800 shadow-sm ring-1 ring-brown-200`}
      >
        {value}
      </div>
      {note && <p className="text-center text-sm text-brown-600 italic">{note}</p>}
    </div>
  );
}
