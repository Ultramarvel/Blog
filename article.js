const progress = document.querySelector('.reading-progress span');
const prose = document.querySelector('.prose');
const tocLinks = [...document.querySelectorAll('.toc a')];
const tocItems = tocLinks
  .map((link) => ({
    link,
    section: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  }))
  .filter((item) => item.section);

const updateProgress = () => {
  if (!progress || !prose) return;
  const rect = prose.getBoundingClientRect();
  const total = Math.max(prose.offsetHeight - innerHeight, 0);
  const done = Math.min(Math.max(-rect.top, 0), total);
  progress.style.width = `${total > 0 ? (done / total) * 100 : 0}%`;
};

const updateTableOfContents = () => {
  if (!tocItems.length) return;
  const activationLine = Math.min(innerHeight * .3, 220);
  let activeItem = tocItems[0];

  tocItems.forEach((item) => {
    if (item.section.getBoundingClientRect().top <= activationLine) activeItem = item;
  });

  tocLinks.forEach((link) => {
    link.classList.toggle('current', link === activeItem.link);
  });
};

let updateFrame = 0;
const requestPageUpdate = () => {
  if (updateFrame) return;
  updateFrame = requestAnimationFrame(() => {
    updateFrame = 0;
    updateProgress();
    updateTableOfContents();
  });
};

addEventListener('scroll', requestPageUpdate, { passive: true });
addEventListener('resize', requestPageUpdate);
updateProgress();
updateTableOfContents();
