import { imageSources } from "@/lib/images";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  /** Original filename in `attached_assets/`, e.g. "EVOLUTION_D-MAX_XT4_RED_1768250430375.png". */
  name: string;
  /** Descriptive alt text. Required: every image on this site says what it shows. */
  alt: string;
  /** `sizes` attribute. Defaults to full-viewport-width, which is only right for heroes. */
  sizes?: string;
  /**
   * Set on the one image that is the page's Largest Contentful Paint. It loads
   * eagerly at high priority; everything else is lazy.
   */
  priority?: boolean;
  className?: string;
  /**
   * Class applied to the wrapping `<picture>`. Defaults to `contents`, which
   * takes the wrapper out of layout so the `<img>` sizes against the original
   * container exactly as a bare `<img>` did.
   */
  pictureClassName?: string;
  /** Preserved `data-testid` hook from the pre-conversion markup. */
  testId?: string;
}

/**
 * A `<picture>` that serves AVIF, then WebP, at the narrowest width the layout
 * needs. Intrinsic `width`/`height` are always emitted so the browser reserves
 * the right box before the bytes arrive and the page does not shift.
 */
export function ResponsiveImage({
  name,
  alt,
  sizes = "100vw",
  priority = false,
  className,
  pictureClassName = "contents",
  testId,
}: ResponsiveImageProps) {
  const { src, avifSrcSet, webpSrcSet, width, height } = imageSources(name);

  // React 18 does not recognize `fetchPriority`, and it serializes `srcSet`
  // with its camelCase spelling. HTML attribute names are case-insensitive so
  // both work in a browser, but spreading the DOM spellings keeps the emitted
  // markup exactly what the spec describes and what tooling greps for.
  const priorityAttrs = { fetchpriority: priority ? "high" : "auto" };

  return (
    <picture className={pictureClassName}>
      <source type="image/avif" {...{ srcset: avifSrcSet }} sizes={sizes} />
      <source type="image/webp" {...{ srcset: webpSrcSet }} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        {...priorityAttrs}
        className={cn(className)}
        data-testid={testId}
      />
    </picture>
  );
}
