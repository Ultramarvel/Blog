const progress=document.querySelector('.reading-progress span');
const prose=document.querySelector('.prose');
const updateProgress=()=>{if(!progress||!prose)return;const rect=prose.getBoundingClientRect();const total=prose.offsetHeight-innerHeight;const done=Math.min(Math.max(-rect.top,0),total);progress.style.width=`${total>0?done/total*100:0}%`};
addEventListener('scroll',updateProgress,{passive:true});updateProgress();
const tocLinks=[...document.querySelectorAll('.toc a')];
const sections=tocLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
const tocObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){tocLinks.forEach(link=>link.classList.toggle('current',link.hash===`#${entry.target.id}`))}}),{rootMargin:'-15% 0px -70% 0px'});
sections.forEach(section=>tocObserver.observe(section));
