const progress = document.querySelector('.reading-progress span');
const prose = document.querySelector('.prose');
const tocLinks = [...document.querySelectorAll('.toc a')];
const tocItems = tocLinks
  .map((link) => ({
    link,
    section: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  }))
  .filter((item) => item.section);
let clickedItem = null;
let clickReleaseTimer = 0;

const setActiveTocItem = (activeItem) => {
  tocLinks.forEach((link) => {
    const isActive = link === activeItem.link;
    link.classList.toggle('current', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

const updateProgress = () => {
  if (!progress || !prose) return;
  const rect = prose.getBoundingClientRect();
  const total = Math.max(prose.offsetHeight - innerHeight, 0);
  const done = Math.min(Math.max(-rect.top, 0), total);
  progress.style.width = `${total > 0 ? (done / total) * 100 : 0}%`;
};

const updateTableOfContents = () => {
  if (!tocItems.length) return;
  if (clickedItem) {
    setActiveTocItem(clickedItem);
    return;
  }
  const activationLine = Math.min(innerHeight * .3, 220);
  let activeItem = tocItems[0];

  tocItems.forEach((item) => {
    if (item.section.getBoundingClientRect().top <= activationLine) activeItem = item;
  });

  setActiveTocItem(activeItem);
};

tocItems.forEach((item) => {
  item.link.addEventListener('click', () => {
    clickedItem = item;
    setActiveTocItem(item);
    clearTimeout(clickReleaseTimer);
    clickReleaseTimer = setTimeout(() => {
      clickedItem = null;
      updateTableOfContents();
    }, 900);
  });
});

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
