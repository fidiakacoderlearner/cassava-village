import { useState } from 'react';

const BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export default function LetterTitle({ lines = [], className = '', sound, interactive = true, connected = false }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  let i = 0;

  const h1Class = `select-none font-display font-bold uppercase leading-[1.25] ${className}`;
  const fontStyle = { fontFamily: "'Beaver Punch', 'Lilita One', 'Poppins', ui-sans-serif, system-ui, sans-serif" };

  if (connected) {
    return (
      <h1 className={h1Class} style={fontStyle}>
        {lines.map((line, li) => {
          const isObj = typeof line === 'object';
          const text = isObj ? line.text : line;
          const indent = isObj && line.indent;
          return (
            <span
              key={li}
              className={`block whitespace-nowrap ${indent ? 'ml-[2.5em]' : ''}`}
              style={{ letterSpacing: '-0.04em' }}
            >
              {text}
            </span>
          );
        })}
      </h1>
    );
  }

  return (
    <h1 className={h1Class} style={fontStyle}>
      {lines.map((line, li) => {
        const isObj = typeof line === 'object';
        const text = isObj ? line.text : line;
        const indent = isObj && line.indent;
        return (
          <span key={li} className={`block whitespace-nowrap ${indent ? 'ml-[2.5em]' : ''}`}>
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
