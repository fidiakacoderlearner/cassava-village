export default function Formula({ value, note }) {
  return (
    <div className="flex flex-col items-center gap-2 my-1">
      <div className="w-fit rounded-2xl bg-sand/70 px-5 py-3 font-display text-xl font-semibold text-brown-800 shadow-sm ring-1 ring-brown-200 md:text-2xl">
        {value}
      </div>
      {note && <p className="text-center text-sm text-brown-600 italic">{note}</p>}
    </div>
  );
}
