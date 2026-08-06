const assets = import.meta.glob('/src/assets/*.{png,jpg,jpeg,svg,webp,gif}', { eager: true });
const assetMap = Object.fromEntries(
  Object.entries(assets).map(([path, mod]) => {
    const name = path.split('/').pop().toLowerCase();
    return [name, mod.default];
  })
);

export default function AssetImage({ name, className = '', fallback = null, alt = '' }) {
  const image =
    assetMap[`${name}.png`] ||
    assetMap[`${name}.jpg`] ||
    assetMap[`${name}.jpeg`] ||
    assetMap[`${name}.svg`] ||
    assetMap[`${name}.webp`] ||
    assetMap[`${name}.gif`];

  if (image) {
    return <img src={image} alt={alt} className={className} />;
  }
  return fallback;
}
