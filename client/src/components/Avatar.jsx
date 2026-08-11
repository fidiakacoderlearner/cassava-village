const assets = import.meta.glob('/src/assets/*.{png,jpg,jpeg,svg,webp,gif}', { eager: true });
const assetMap = Object.fromEntries(
  Object.entries(assets).map(([path, mod]) => {
    const name = path.split('/').pop().toLowerCase();
    return [name, mod.default];
  })
);

export default function Avatar({ name = 'pak-restu', emoji = '🧑‍🌾', bg = '#f3c599', className = '' }) {
  const cls = 'h-10 w-10 text-lg';

  const image = assetMap[`${name}.png`] || assetMap[`${name}.jpg`] || assetMap[`${name}.svg`];

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${cls} shrink-0 rounded-full object-cover shadow ${className}`}
      />
    );
  }

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full shadow-inner ${className}`}
      style={{ backgroundColor: bg }}
      role="img"
      aria-label={name}
    >
      {emoji}
    </div>
  );
}
