import { useEffect, useRef, useState } from 'react';

const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;

function hasHtml(s) {
  return TAG_RE.test(s);
}

function visibleLen(s) {
  return s.replace(TAG_RE, '').length;
}

function buildVisible(text, maxVisible) {
  if (maxVisible <= 0) return '';
  const chunks = text.split(/(\s+)/);
  const open = [];
  let visCount = 0;
  let result = '';
  let cutPos = -1;

  for (let ci = 0; ci < chunks.length; ci++) {
    const ch = chunks[ci];
    if (/^\s+$/.test(ch)) {
      if (visCount < maxVisible) {
        result += ch;
        cutPos = result.length;
      }
      continue;
    }

    const tags = [];
    let m;
    TAG_RE.lastIndex = 0;
    while ((m = TAG_RE.exec(ch)) !== null) {
      tags.push({ tag: m[0], close: m[0][1] === '/', name: m[1].toLowerCase() });
    }

    for (const t of tags) {
      if (t.close) {
        const idx = open.lastIndexOf(t.name);
        if (idx !== -1) open.splice(idx, 1);
      } else {
        open.push(t.name);
      }
    }

    if (visCount >= maxVisible) break;

    const stripped = ch.replace(TAG_RE, '');
    const need = Math.min(stripped.length, maxVisible - visCount);
    visCount += need;

    if (need < stripped.length) {
      let partial = '';
      let vc = 0;
      TAG_RE.lastIndex = 0;
      let lastEnd = 0;
      while ((m = TAG_RE.exec(ch)) !== null) {
        partial += ch.slice(lastEnd, m.index);
        lastEnd = m.index + m[0].length;
        partial += m[0];
      }
      partial += ch.slice(lastEnd);
      const plainBefore = partial.replace(TAG_RE, '');
      const sliceIdx = [...plainBefore].slice(0, need).join('').length;
      let plainIdx = 0;
      let charIdx = 0;
      while (charIdx < partial.length && plainIdx < sliceIdx) {
        if (partial[charIdx] === '<') {
          const end = partial.indexOf('>', charIdx);
          if (end !== -1) {
            partial = partial.slice(0, charIdx) + partial.slice(end + 1);
            continue;
          }
        }
        plainIdx++;
        charIdx++;
      }
      result += partial.slice(0, charIdx);
      cutPos = result.length;
      break;
    }

    result += ch;
    cutPos = result.length;
  }

  if (open.length > 0) {
    const closeTags = [...open].reverse().map((n) => `</${n}>`).join('');
    result = result.slice(0, cutPos) + closeTags + result.slice(cutPos);
  }

  return result;
}

export default function Typewriter({ text, speed = 26, playSound, onDone, className = '', skipLabel = '', instant = false }) {
  const isHtml = hasHtml(text);
  const totalVisible = visibleLen(text);
  const [count, setCount] = useState(() => (instant ? totalVisible : 0));
  const done = count >= totalVisible;
  const doneRef = useRef(false);

  useEffect(() => {
    setCount(instant ? totalVisible : 0);
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
      setCount((c) => c + 1);
      if (playSound) playSound();
    }, speed);
    return () => clearTimeout(id);
  }, [count, text, speed, done, onDone, playSound]);

  function skip() {
    setCount(totalVisible);
  }

  const display = isHtml ? buildVisible(text, count) : text.slice(0, count);

  return (
    <div>
      <p className={className}>
        {isHtml ? (
          <span className="math-text" dangerouslySetInnerHTML={{ __html: display }} />
        ) : (
          display
        )}
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
