import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '../icons.jsx';

export default function ClassDropdown({ classes, value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = classes.find((c) => c.id === value) || null;
  const disabled = classes.length === 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        data-testid="class-dropdown-trigger"
        className="flex min-w-40 max-w-52 items-center justify-between gap-2 rounded-2xl border border-brown-200 bg-white py-2.5 pl-4 pr-2 text-sm font-semibold text-brown-800 outline-none transition focus:border-brown-500 disabled:cursor-not-allowed disabled:text-brown-400"
      >
        <span className="min-w-0 flex-1 truncate">{selected ? selected.name : t('teacher.noClasses')}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-brown-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute right-0 z-30 mt-2 w-full min-w-48 overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-brown-200">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onChange(c.id); setOpen(false); }}
              data-testid="class-option"
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                c.id === value ? 'bg-peach/50 text-brown-800' : 'text-brown-700 hover:bg-peach/30'
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              {c.id === value && <CheckIcon className="h-4 w-4 shrink-0 text-brown-800" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}