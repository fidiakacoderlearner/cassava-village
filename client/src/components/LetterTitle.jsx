import { useState } from 'react';

const BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export default function LetterTitle({ lines = [], className = '', sound, interactive = true }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  let i = 0;

  const h1Class = `select-none font-display font-bold uppercase leading-[1.25] ${className}`;
  const fontStyle = { fontFamily: "'Beaver Punch', 'Lilita One', 'Poppins', ui-sans-serif, system-ui, sans-serif" };

  const prevLine = (li) =>
    li > 0 ? (typeof lines[li - 1] === 'object' ? lines[li - 1].text : lines[li - 1]) : '';

  return (
    <h1 className={h1Class} style={fontStyle}>
      {lines.map((line, li) => {
        const isObj = typeof line === 'object';
        const text = isObj ? line.text : line;
        const indent = isObj ? line.indent || 0 : 0;
        return (
          <span key={li} className="block whitespace-nowrap">
            {indent > 0 && (
              <span aria-hidden style={{ visibility: 'hidden' }}>
                {prevLine(li).slice(0, indent)}
              </span>
            )}
            {text.split('').map((ch, ci) => {
              const gi = i;
              i += 1;
              const active = interactive && hoveredIdx === gi;
              return (
                <span
                  key={ci}
                  className="inline-block cursor-default"
                  style={{
                    transform: active
                      ? 'translateY(-0.3em) rotate(-4deg) scale(1.06)'
                      : 'none',
                    transition: interactive
                      ? `transform 0.28s ${BOUNCE}, color 0.2s ease`
                      : 'none',
                    color: active ? '#ffffff' : undefined,
                  }}
                  onMouseEnter={
                    interactive
                      ? () => {
                          setHoveredIdx(gi);
                          sound?.();
                        }
                      : undefined
                  }
                  onMouseLeave={interactive ? () => setHoveredIdx(null) : undefined}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
