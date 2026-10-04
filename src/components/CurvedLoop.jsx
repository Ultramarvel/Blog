'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import './CurvedLoop.css';

/**
 * @param {{
 *   marqueeText?: string;
 *   speed?: number;
 *   className?: string;
 *   curveAmount?: number;
 *   direction?: 'left' | 'right';
 *   interactive?: boolean;
 * }} props
 */
export default function CurvedLoop({
  marqueeText = '',
  speed = 2,
  className = '',
  curveAmount = 150,
  direction = 'left',
  interactive = true,
}) {
  const text = useMemo(() => `${marqueeText.trimEnd()}\u00A0`, [marqueeText]);
  const measureRef = useRef(null);
  const textPathRef = useRef(null);
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const directionRef = useRef(direction);
  const velocityRef = useRef(0);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pathId = `curve-${useId().replaceAll(':', '')}`;
  const pathD = `M-120,70 Q500,${70 + curveAmount} 1560,70`;
  const totalText = spacing
    ? Array(Math.ceil(1900 / spacing) + 2).fill(text).join('')
    : text;
  const ready = spacing > 0;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let active = true;
    const measure = () => {
      const measured = measureRef.current?.getComputedTextLength() ?? 0;
      if (active && measured > 0) setSpacing(measured);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => {
      active = false;
      window.removeEventListener('resize', measure);
    };
  }, [text, className]);

  useEffect(() => {
    if (!spacing || !textPathRef.current) return;
    const initialOffset = -spacing;
    textPathRef.current.setAttribute('startOffset', `${initialOffset}px`);
    setOffset(initialOffset);
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready || reducedMotion) return undefined;
    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = directionRef.current === 'right' ? speed : -speed;
        const current = Number.parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let next = current + delta;
        if (next <= -spacing) next += spacing;
        if (next > 0) next -= spacing;
        textPathRef.current.setAttribute('startOffset', `${next}px`);
        setOffset(next);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ready, reducedMotion, spacing, speed]);

  const handlePointerDown = (event) => {
    if (!interactive || reducedMotion) return;
    dragRef.current = true;
    lastXRef.current = event.clientX;
    velocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!interactive || reducedMotion || !dragRef.current || !textPathRef.current) return;
    const delta = event.clientX - lastXRef.current;
    lastXRef.current = event.clientX;
    velocityRef.current = delta;
    const current = Number.parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
    let next = current + delta;
    if (next <= -spacing) next += spacing;
    if (next > 0) next -= spacing;
    textPathRef.current.setAttribute('startOffset', `${next}px`);
    setOffset(next);
  };

  const endDrag = () => {
    if (!interactive || reducedMotion) return;
    dragRef.current = false;
    directionRef.current = velocityRef.current > 0 ? 'right' : 'left';
  };

  return (
    <div
      className="curved-loop-jacket"
      style={{ opacity: ready ? 1 : 0 }}
      role="img"
      aria-label={`${marqueeText}。可水平拖动改变方向。`}
      data-interactive={interactive && !reducedMotion ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <svg className="curved-loop-svg" viewBox="0 0 1440 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <text
          ref={measureRef}
          className={className}
          xmlSpace="preserve"
          style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
        >
          {text}
        </text>
        <defs>
          <path id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text xmlSpace="preserve" className={className}>
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={`${offset}px`} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
