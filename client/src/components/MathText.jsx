const ALLOWED = new Set(['i', 'b', 'sup', 'sub', 'span']);

function sanitize(html) {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (match, tag, attrs) => {
    const low = tag.toLowerCase();
    if (!ALLOWED.has(low)) return '';
    if (low === 'span') {
      const styleMatch = attrs.match(/style="([^"]*)"/);
      if (!styleMatch) return '';
      return `<span style="${styleMatch[1]}">`;
    }
    return match;
  });
}

export default function MathText({ text, className = '' }) {
  if (!text) return null;
  return (
    <span
      className={`math-text${className ? ' ' + className : ''}`}
      dangerouslySetInnerHTML={{ __html: sanitize(text) }}
    />
  );
}
