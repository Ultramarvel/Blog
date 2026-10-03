'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './MagicBento.css';

const MOBILE_BREAKPOINT = 768;
const DEFAULT_GLOW_COLOR = '183, 210, 103';

/**
 * @typedef {{
 *   number: string;
 *   code: string;
 *   status: string;
 *   title: string;
 *   englishTitle: string;
 *   description: string;
 *   tags: string[];
 *   href: string;
 *   action: string;
 *   featured: boolean;
 * }} OpenSourceProject
 */

const createParticleElement = (x, y, color) => {
  const particle = document.createElement('span');
  particle.className = 'magic-bento-particle';
  particle.style.cssText = `left:${x}px;top:${y}px;background:rgba(${color},1);box-shadow:0 0 9px rgba(${color},.72);`;
  return particle;
};

const updateCardGlow = (card, mouseX, mouseY, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.max(
    0,
    Math.hypot(mouseX - centerX, mouseY - centerY) - Math.max(rect.width, rect.height) / 2,
  );
  const proximity = radius * .5;
  const fadeDistance = radius * .78;
  const intensity = distance <= proximity
    ? 1
    : Math.max(0, (fadeDistance - distance) / (fadeDistance - proximity));

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', intensity.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
  return distance;
};

function useAnimationPreference(disableAnimations) {
  const [disabled, setDisabled] = useState(disableAnimations);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setDisabled(disableAnimations || window.innerWidth <= MOBILE_BREAKPOINT || media.matches);
    update();
    window.addEventListener('resize', update);
    media.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      media.removeEventListener('change', update);
    };
  }, [disableAnimations]);

  return disabled;
}

function ParticleCard({
  children,
  className,
  disableAnimations,
  particleCount,
  glowColor,
  enableTilt,
  enableMagnetism,
  clickEffect,
}) {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: .22,
        onComplete: () => particle.remove(),
      });
    });
    particlesRef.current = [];
  }, []);

  const showParticles = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    const { width, height } = card.getBoundingClientRect();

    Array.from({ length: particleCount }).forEach((_, index) => {
      const timeout = setTimeout(() => {
        if (!card.matches(':hover')) return;
        const particle = createParticleElement(Math.random() * width, Math.random() * height, glowColor);
        card.appendChild(particle);
        particlesRef.current.push(particle);
        gsap.fromTo(
          particle,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: .28, ease: 'back.out(1.7)' },
        );
        gsap.to(particle, {
          x: (Math.random() - .5) * 85,
          y: (Math.random() - .5) * 85,
          opacity: .25,
          duration: 1.6 + Math.random() * 1.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }, index * 70);
      timeoutsRef.current.push(timeout);
    });
  }, [glowColor, particleCount]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || disableAnimations) return undefined;

    const handleEnter = () => showParticles();
    const handleMove = (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const animation = {};

      if (enableTilt) {
        animation.rotateX = ((y - centerY) / centerY) * -7;
        animation.rotateY = ((x - centerX) / centerX) * 7;
        animation.transformPerspective = 1100;
      }
      if (enableMagnetism) {
        animation.x = (x - centerX) * .025;
        animation.y = (y - centerY) * .025;
      }
      gsap.to(card, { ...animation, duration: .18, ease: 'power2.out' });
    };
    const handleLeave = () => {
      clearParticles();
      gsap.to(card, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: .35, ease: 'power2.out' });
    };
    const handleClick = (event) => {
      if (!clickEffect) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const distance = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'magic-bento-ripple';
      ripple.style.cssText = `width:${distance * 2}px;height:${distance * 2}px;left:${x - distance}px;top:${y - distance}px;--glow-color:${glowColor};`;
      card.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: .75 }, {
        scale: 1,
        opacity: 0,
        duration: .72,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });
    };

    card.addEventListener('mouseenter', handleEnter);
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('click', handleClick);
    return () => {
      card.removeEventListener('mouseenter', handleEnter);
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
      card.removeEventListener('click', handleClick);
      clearParticles();
    };
  }, [clearParticles, clickEffect, disableAnimations, enableMagnetism, enableTilt, glowColor, showParticles]);

  return <article ref={cardRef} className={className}>{children}</article>;
}

function GlobalSpotlight({ gridRef, disabled, radius, glowColor }) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || disabled) return undefined;

    const spotlight = document.createElement('div');
    spotlight.className = 'magic-bento-spotlight';
    spotlight.style.setProperty('--glow-color', glowColor);
    document.body.appendChild(spotlight);

    const section = grid.closest('.open-source');
    const cards = [...grid.querySelectorAll('.magic-bento-card')];
    const handleMove = (event) => {
      const sectionRect = section?.getBoundingClientRect();
      const inside = sectionRect
        && event.clientX >= sectionRect.left
        && event.clientX <= sectionRect.right
        && event.clientY >= sectionRect.top
        && event.clientY <= sectionRect.bottom;

      if (!inside) {
        cards.forEach((card) => card.style.setProperty('--glow-intensity', '0'));
        gsap.to(spotlight, { opacity: 0, duration: .25 });
        return;
      }

      const minDistance = Math.min(...cards.map((card) => updateCardGlow(card, event.clientX, event.clientY, radius)));
      const opacity = Math.max(0, 1 - minDistance / (radius * .78)) * .62;
      gsap.to(spotlight, {
        left: event.clientX,
        top: event.clientY,
        opacity,
        duration: .12,
        ease: 'power2.out',
      });
    };
    const handleLeave = () => gsap.to(spotlight, { opacity: 0, duration: .25 });

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      spotlight.remove();
    };
  }, [disabled, glowColor, gridRef, radius]);

  return null;
}

/**
 * @param {{
 *   projects?: OpenSourceProject[];
 *   enableStars?: boolean;
 *   enableSpotlight?: boolean;
 *   enableBorderGlow?: boolean;
 *   disableAnimations?: boolean;
 *   spotlightRadius?: number;
 *   particleCount?: number;
 *   enableTilt?: boolean;
 *   glowColor?: string;
 *   clickEffect?: boolean;
 *   enableMagnetism?: boolean;
 * }} props
 */
export default function MagicBento({
  projects = [],
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = 320,
  particleCount = 10,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) {
  const gridRef = useRef(null);
  const animationsDisabled = useAnimationPreference(disableAnimations);

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disabled={animationsDisabled}
          radius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      <div className="open-source__grid bento-section" ref={gridRef}>
        {projects.map((project) => {
          const classes = [
            'project-card',
            project.featured ? 'project-card--featured' : '',
          ].filter(Boolean).join(' ');
          const cardClasses = [
            'magic-bento-card',
            'particle-container',
            enableBorderGlow ? 'magic-bento-card--border-glow' : '',
          ].filter(Boolean).join(' ');

          return (
            <a className={classes} href={project.href} aria-label={`${project.action}：${project.title}`} key={project.number}>
              <ParticleCard
                className={cardClasses}
                disableAnimations={animationsDisabled || !enableStars}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                enableMagnetism={enableMagnetism}
                clickEffect={clickEffect}
              >
                <div className="project-card__meta">
                  <span>PROJECT / {project.number}</span>
                  <span><i></i>{project.status}</span>
                </div>
                <div className="project-card__mark" aria-hidden="true">{project.code}</div>
                <div className="project-card__copy">
                  <p>{project.englishTitle}</p>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <ul aria-label="技术栈">
                  {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
                <span className="project-card__action">{project.action}<i>↗</i></span>
                {project.featured && (
                  <div className="project-card__signal" aria-hidden="true">
                    <span></span><span></span><span></span><span></span>
                    <i></i><i></i><i></i>
                  </div>
                )}
              </ParticleCard>
            </a>
          );
        })}
      </div>
    </>
  );
}
