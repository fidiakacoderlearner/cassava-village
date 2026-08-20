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
  loading = 'lazy' // Add lazy loading by default
}) {
  const baseName = name.toLowerCase();
  
  // Check for different formats
  const avifSrc = assetMap[`${baseName}.avif`];
  const webpSrc = assetMap[`${baseName}.webp`];
  const pngSrc = assetMap[`${baseName}.png`];
  const jpgSrc = assetMap[`${baseName}.jpg`] || assetMap[`${baseName}.jpeg`];
  const svgSrc = assetMap[`${baseName}.svg`];
  const gifSrc = assetMap[`${baseName}.gif`];
  
  const imageSrc = pngSrc || jpgSrc || svgSrc || gifSrc || webpSrc || avifSrc;

  if (!imageSrc) {
    console.warn(`AssetImage: No image found for "${name}"`);
    return fallback;
  }

  // Use picture element if we have AVIF or WebP versions
  if (avifSrc || webpSrc) {
    return (
      <picture>
        {/* AVIF format (best compression) */}
        {avifSrc && (
          <source 
            srcSet={avifSrc} 
            type="image/avif" 
          />
        )}
        {/* WebP format (good fallback) */}
        {webpSrc && (
          <source 
            srcSet={webpSrc} 
            type="image/webp" 
          />
        )}
        {/* Fallback to original format */}
        <img 
          src={imageSrc}
          alt={alt}
          className={className}
          style={style}
          loading={loading}
          decoding="async"
        />
      </picture>
    );
  }

  // Fallback to regular img element
  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      style={style}
      loading={loading}
      decoding="async"
    />
  );
}
