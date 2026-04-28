'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ViewportVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  mp4Src: string;
  webmSrc?: string;
  pauseWhenOutOfView?: boolean;
  observerThreshold?: number;
}

function playSafely(video: HTMLVideoElement) {
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      // Ignore autoplay rejections in restrictive browsers.
    });
  }
}

export function ViewportVideo({
  mp4Src,
  webmSrc,
  pauseWhenOutOfView = true,
  observerThreshold = 0.35,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = 'metadata',
  ...rest
}: ViewportVideoProps) {
  const ref = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (!pauseWhenOutOfView || !ref.current) return;

    const video = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;
        if (entry.isIntersecting) {
          playSafely(video);
        } else {
          video.pause();
        }
      },
      { threshold: observerThreshold }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [pauseWhenOutOfView, observerThreshold]);

  return (
    <video
      ref={ref}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      className={cn(className)}
      {...rest}
    >
      <source src={webmSrc ?? mp4Src.replace(/\.mp4$/i, '.webm')} type="video/webm" />
      <source src={mp4Src} type="video/mp4" />
    </video>
  );
}
