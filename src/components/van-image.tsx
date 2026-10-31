"use client";

import { useEffect, useRef, useState } from "react";
import { TruckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function VanImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Covers the case where the browser serves the image from cache and fires
  // `load` before React attaches the listener — `onLoad` would never run.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-secondary to-muted text-muted-foreground/70",
          className,
        )}
      >
        <TruckIcon className="size-10" strokeWidth={1.5} />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
      className={cn(
        "object-cover bg-muted transition-opacity duration-500",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
