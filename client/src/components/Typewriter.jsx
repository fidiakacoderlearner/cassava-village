import { useEffect, useRef, useState } from 'react';

export default function Typewriter({ text, speed = 26, playSound, onDone, className = '', skipLabel = '', instant = false }) {
  const [len, setLen] = useState(() => (instant ? text.length : 0));
  const done = len >= text.length;
  const doneRef = useRef(false);

  useEffect(() => {
    setLen(instant ? text.length : 0);
    doneRef.current = false;
  }, [text, instant]);

  useEffect(() => {
    if (done) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return undefined;
    }
    const id = setTimeout(() => {
      setLen((l) => l + 1);
      if (playSound) playSound();
    }, speed);
    return () => clearTimeout(id);
  }, [len, text, speed, done, onDone, playSound]);

  function skip() {
    setLen(text.length);
  }

  return (
    <div>
      <p className={className}>
        {text.slice(0, len)}
        {!done && <span className="tw-caret">▍</span>}
      </p>
      {skipLabel && !done && (
        <button
          onClick={skip}
          className="mt-2 ml-auto block text-xs font-bold text-brown-500 underline-offset-2 transition-colors hover:text-brown-800 hover:underline"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}
