'use client';

import React from 'react';

/**
 * Plain `<img>` that swaps to a fallback src when the primary URL fails to
 * load. Use for CMS-driven images where the editor might paste an unreachable
 * URL, or for unsplash/external sources that occasionally 404.
 */
export default function FallbackImg({
  src,
  fallback,
  alt,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallback: string }) {
  const [current, setCurrent] = React.useState(src);
  const triedFallback = React.useRef(false);

  // Reset when the parent passes a new primary src.
  React.useEffect(() => {
    setCurrent(src);
    triedFallback.current = false;
  }, [src]);

  return (
    <img
      {...rest}
      src={current as string}
      alt={alt}
      onError={() => {
        if (triedFallback.current) return;
        triedFallback.current = true;
        setCurrent(fallback);
      }}
    />
  );
}
