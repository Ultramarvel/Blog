'use client';

import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './BlobCursor.css';

export default function BlobCursor({
  blobType = 'circle',
  fillColor = '#5227ff',
  trailCount = 3,
  sizes = [60, 125, 75],
  innerSizes = [20, 35, 25],
  innerColor = 'rgba(255, 255, 255, .8)',
  opacities = [.6, .6, .6],
  shadowColor = 'rgba(0, 0, 0, .75)',
  shadowBlur = 5,
  shadowOffsetX = 10,
  shadowOffsetY = 10,
  filterId = 'site-blob-cursor',
  filterStdDeviation = 30,
  filterColorMatrixValues = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10',
  useFilter = true,
  fastDuration = .1,
  slowDuration = .5,
  fastEase = 'power3.out',
  slowEase = 'power1.out',
  zIndex = 100,
}) {
  const containerRef = useRef(null);
  const blobsRef = useRef([]);

  const updateOffset = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    return rect ? { left: rect.left, top: rect.top } : { left: 0, top: 0 };
  }, []);

  const handleMove = useCallback((event) => {
    const { left, top } = updateOffset();
    const x = event.clientX - left;
    const y = event.clientY - top;

    blobsRef.current.forEach((element, index) => {
      if (!element) return;
      const isLead = index === 0;
      gsap.to(element, {
        x,
        y,
        opacity: opacities[index] ?? opacities.at(-1) ?? .4,
        duration: isLead ? fastDuration : slowDuration,
        ease: isLead ? fastEase : slowEase,
        overwrite: 'auto',
      });
    });
  }, [fastDuration, fastEase, opacities, slowDuration, slowEase, updateOffset]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (reduceMotion || coarsePointer) return undefined;

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('resize', updateOffset, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('resize', updateOffset);
      blobsRef.current.forEach((element) => element && gsap.killTweensOf(element));
    };
  }, [handleMove, updateOffset]);

  return (
    <div ref={containerRef} className="blob-cursor-layer" style={{ zIndex }} aria-hidden="true">
      {useFilter && (
        <svg className="blob-cursor-filter" aria-hidden="true">
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={filterStdDeviation} />
            <feColorMatrix in="blur" values={filterColorMatrixValues} />
          </filter>
        </svg>
      )}
      <div className="blob-cursor-main" style={{ filter: useFilter ? `url(#${filterId})` : undefined }}>
        {Array.from({ length: trailCount }).map((_, index) => {
          const size = sizes[index] ?? sizes.at(-1) ?? 60;
          const innerSize = innerSizes[index] ?? innerSizes.at(-1) ?? 20;
          const radius = blobType === 'circle' ? '50%' : '0%';
          return (
            <div
              key={index}
              ref={(element) => { blobsRef.current[index] = element; }}
              className="blob-cursor-blob"
              style={{
                width: size,
                height: size,
                borderRadius: radius,
                backgroundColor: fillColor,
                opacity: 0,
                boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`,
              }}
            >
              <div
                className="blob-cursor-dot"
                style={{
                  width: innerSize,
                  height: innerSize,
                  top: (size - innerSize) / 2,
                  left: (size - innerSize) / 2,
                  backgroundColor: innerColor,
                  borderRadius: radius,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
