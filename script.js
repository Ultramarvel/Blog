const toggle=document.querySelector('.theme-toggle');
toggle?.addEventListener('click',()=>{document.body.classList.toggle('light');localStorage.setItem('field-notes-theme',document.body.classList.contains('light')?'light':'dark')});
if(localStorage.getItem('field-notes-theme')==='light')document.body.classList.add('light');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.section-heading,.featured-card,.post-row,.about-content').forEach(el=>{el.classList.add('reveal');observer.observe(el)});

const orbitalArt=document.querySelector('.hero-art');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(orbitalArt&&!reduceMotion.matches){
  let frame=0;
  const moveArt=event=>{
    const bounds=orbitalArt.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
    const y=Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      orbitalArt.style.setProperty('--planet-x',`${x*10}px`);
      orbitalArt.style.setProperty('--planet-y',`${y*8}px`);
      orbitalArt.style.setProperty('--detail-x',`${x*16}px`);
      orbitalArt.style.setProperty('--detail-y',`${y*12}px`);
      orbitalArt.style.setProperty('--light-x',`${35+x*8}%`);
      orbitalArt.style.setProperty('--light-y',`${25+y*7}%`);
    });
  };
  const resetArt=()=>{
    orbitalArt.classList.remove('is-active');
    orbitalArt.style.setProperty('--planet-x','0px');
    orbitalArt.style.setProperty('--planet-y','0px');
    orbitalArt.style.setProperty('--detail-x','0px');
    orbitalArt.style.setProperty('--detail-y','0px');
    orbitalArt.style.setProperty('--light-x','35%');
    orbitalArt.style.setProperty('--light-y','25%');
  };
  orbitalArt.addEventListener('pointerenter',()=>orbitalArt.classList.add('is-active'));
  orbitalArt.addEventListener('pointermove',moveArt);
  orbitalArt.addEventListener('pointerleave',resetArt);
}

const identityStage=document.querySelector('[data-identity-stage]');
if(identityStage&&!reduceMotion.matches){
  let identityFrame=0;
  const setIdentityPosition=(x,y)=>{
    identityStage.style.setProperty('--identity-x',`${x*15}px`);
    identityStage.style.setProperty('--identity-y',`${y*11}px`);
    identityStage.style.setProperty('--identity-back-x',`${x*-5}px`);
    identityStage.style.setProperty('--identity-back-y',`${y*-4}px`);
    identityStage.style.setProperty('--identity-near-x',`${x*8}px`);
    identityStage.style.setProperty('--identity-near-y',`${y*6}px`);
    identityStage.style.setProperty('--identity-far-x',`${x*-11}px`);
    identityStage.style.setProperty('--identity-far-y',`${y*-8}px`);
  };
  const moveIdentity=event=>{
    const bounds=identityStage.getBoundingClientRect();
    const x=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
    const y=Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
    cancelAnimationFrame(identityFrame);
    identityFrame=requestAnimationFrame(()=>setIdentityPosition(x,y));
  };
  const resetIdentity=()=>{
    identityStage.classList.remove('is-active');
    setIdentityPosition(0,0);
  };
  identityStage.addEventListener('pointerenter',()=>identityStage.classList.add('is-active'));
  identityStage.addEventListener('pointermove',moveIdentity);
  identityStage.addEventListener('pointerleave',resetIdentity);
}
