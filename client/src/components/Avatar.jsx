const assets = import.meta.glob('/src/assets/*.{png,jpg,jpeg,svg,webp,gif}', { eager: true });
const assetMap = Object.fromEntries(
  Object.entries(assets).map(([path, mod]) => {
    const name = path.split('/').pop().toLowerCase();
    return [name, mod.default];
  })
);

export default function Avatar({ name = 'pak-restu', emoji = '🧑‍🌾', bg = '#f3c599', size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-10 w-10 text-lg',
    md: 'h-14 w-14 text-2xl',
    lg: 'h-24 w-24 text-4xl',
  };

  const image = assetMap[`${name}.png`] || assetMap[`${name}.jpg`] || assetMap[`${name}.svg`];

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizes[size]} shrink-0 rounded-full object-cover shadow ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full shadow-inner ${className}`}
      style={{ backgroundColor: bg }}
      role="img"
      aria-label={name}
    >
      {emoji}
    </div>
  );
}
