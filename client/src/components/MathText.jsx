const SIMPLE_TAGS = new Set(['i', 'b', 'sup', 'sub']);
const SAFE_STYLE_PROPS = /^(?:display|flex-direction|align-items|justify-content|font-size|vertical-align|border-bottom|border-top|line-height|padding|margin|color|font-weight|font-style)\s*:\s*[-%,\.\w\s]+$/i;
const FORBIDDEN_STYLE = /url\s*\(|expression\s*\(|javascript:|@import|content\s*:|position\s*:|background/i;

function cleanTag(match, low) {
  return `${match.startsWith('</') ? '</' : '<'}${low}>`;
}

function sanitize(html) {
  return String(html).replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (match, tag, attrs) => {
    const low = tag.toLowerCase();
    if (low === 'span') {
      if (match.startsWith('</')) return '</span>';
      const styleMatch = attrs.match(/style\s*=\s*"([^"]*)"/i);
      if (!styleMatch) return '<span>';
      const value = styleMatch[1];
      if (FORBIDDEN_STYLE.test(value)) return '<span>';
      const kept = value
        .split(';')
        .map((p) => p.trim())
        .filter((p) => SAFE_STYLE_PROPS.test(p))
        .join(';');
      return kept ? `<span style="${kept}">` : '<span>';
    }
    if (!SIMPLE_TAGS.has(low)) return '';
    return cleanTag(match, low);
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
