const assets = import.meta.glob('/src/assets/*.{png,jpg,jpeg,svg,webp,gif,avif}', { eager: true });
const assetMap = Object.fromEntries(
  Object.entries(assets).map(([path, mod]) => {
    const name = path.split('/').pop().toLowerCase();
    return [name, mod.default];
  })
);

export default function AssetImage({ 
  name, 
  className = '', 
  style = {},
  fallback = null, 
  alt = '',
  loading = 'lazy'
}) {
  const baseName = name.toLowerCase();
  
  // Check for different formats - priority: avif > webp > png > jpg > svg > gif
  const avifSrc = assetMap[`${baseName}.avif`];
  const webpSrc = assetMap[`${baseName}.webp`];
  const pngSrc = assetMap[`${baseName}.png`];
  const jpgSrc = assetMap[`${baseName}.jpg`] || assetMap[`${baseName}.jpeg`];
  const svgSrc = assetMap[`${baseName}.svg`];
  const gifSrc = assetMap[`${baseName}.gif`];
  
  // Determine best available source (modern formats first)
  const bestSrc = avifSrc || webpSrc || pngSrc || jpgSrc || svgSrc || gifSrc;

  if (!bestSrc) {
    console.warn(`AssetImage: No image found for "${name}"`);
    return fallback;
  }

  // Use picture element if we have modern formats (AVIF or WebP)
  if (avifSrc || webpSrc) {
    return (
      <picture>
        {/* AVIF format (best compression) - highest priority */}
        {avifSrc && (
          <source 
            srcSet={avifSrc} 
            type="image/avif" 
          />
        )}
        {/* WebP format (good fallback) - second priority */}
        {webpSrc && (
          <source 
            srcSet={webpSrc} 
            type="image/webp" 
          />
        )}
        {/* Fallback to best available legacy format */}
        <img 
          src={bestSrc}
          alt={alt}
          className={className}
          style={style}
          loading={loading}
          decoding="async"
        />
      </picture>
    );
  }

  // Fallback to regular img element for legacy formats
  return (
    <img 
      src={bestSrc} 
      alt={alt} 
      className={className}
      style={style}
      loading={loading}
      decoding="async"
    />
  );
}
