import FlexCarousel from './FlexCarousel';
import './RecommendedReading.css';

/**
 * @typedef {{
 *   src: string;
 *   alt: string;
 *   title: string;
 *   subtitle: string;
 *   coverMeta?: string;
 *   href: string;
 *   generated?: boolean;
 *   accent?: string;
 * }} RecommendedItem
 */

/** @param {{ items?: RecommendedItem[] }} props */
export default function RecommendedReading({ items = [] }) {
  const openArticle = (_index, item) => {
    if (item?.href) window.location.assign(item.href);
  };

  if (!items.length) {
    return <p className="recommended-reading__empty">还没有可以推荐的文章。</p>;
  }

  return (
    <div className="recommended-reading">
      <div className="recommended-reading__guide" aria-hidden="true">
        <span>DRAG / SCROLL</span>
        <i></i>
        <span>CLICK TO READ</span>
      </div>
      <FlexCarousel
        items={items}
        preset="liquid"
        intro="rise"
        fit="landscape"
        cardHeight={0.52}
        gap={18}
        radius={22}
        squeeze={0.16}
        focusOnClick
        captions
        ariaLabel="推荐阅读文章轮播"
        onSelect={openArticle}
        className="recommended-reading__carousel"
      />
    </div>
  );
}
