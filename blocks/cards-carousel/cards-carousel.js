import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  if (!block.originalChildren) {
    block.originalChildren = Array.from(block.children).map((row) => {
      const cols = row.querySelectorAll('div');
      const img = cols[0]?.querySelector('img');
      return {
        img: img ? { src: img.src, alt: img.alt } : null,
        content: cols[1]?.cloneNode(true) || null
      };
    });
  }

  let activeSlideIndex = 0;

  const buildCarousel = () => {
    const getCardsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 768) return 1;
      if (width < 1024) return 2;
      return 3;
    };

    const cardsPerSlide = getCardsPerSlide();

    const cards = block.originalChildren.map((cardData) => {
      const card = document.createElement('div');
      card.className = 'carousel-card';

      if (cardData.img) {
        const picture = createOptimizedPicture(
          cardData.img.src,
          cardData.img.alt || '',
          false,
          [{ width: 750 }]
        );
        card.appendChild(picture);
      }

      if (cardData.content) {
        const content = document.createElement('div');
        content.className = 'carousel-content';
        content.append(
          ...Array.from(cardData.content.children).map((c) => c.cloneNode(true))
        );
        card.appendChild(content);
      }

      return card;
    });

    const carousel = document.createElement('div');
    carousel.className = 'carousel-container';

    const slidesWrapper = document.createElement('div');
    slidesWrapper.className = 'carousel-slides';

    for (let i = 0; i < cards.length; i += cardsPerSlide) {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';

      if (i + cardsPerSlide > cards.length && cards.length > cardsPerSlide) {
        const lastGroup = cards.slice(-cardsPerSlide);
        lastGroup.forEach((card) => slide.appendChild(card.cloneNode(true)));
      } else {
        const group = cards.slice(i, i + cardsPerSlide);
        group.forEach((card) => slide.appendChild(card));
      }

      slidesWrapper.appendChild(slide);
    }

    carousel.appendChild(slidesWrapper);

    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    const slides = slidesWrapper.children;
    const bullets = [];

    Array.from(slides).forEach((slide, i) => {
      const bullet = document.createElement('button');
      bullet.className = 'carousel-bullet';
      if (i === activeSlideIndex) bullet.classList.add('active');

      bullet.addEventListener('click', () => {
        Array.from(slides).forEach((s) => {
          s.style.transform = `translateX(-${i * 100}%)`;
        });
        bullets.forEach((b) => b.classList.remove('active'));
        bullet.classList.add('active');
        activeSlideIndex = i;
      });

      nav.appendChild(bullet);
      bullets.push(bullet);
    });

    carousel.appendChild(nav);
    block.innerHTML = '';
    block.appendChild(carousel);

    Array.from(slides).forEach((slide) => {
      slide.style.transform = `translateX(-${activeSlideIndex * 100}%)`;
    });
    bullets.forEach((b) => b.classList.remove('active'));
    if (bullets[activeSlideIndex]) bullets[activeSlideIndex].classList.add('active');
  };

  buildCarousel();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(buildCarousel, 200);
  });
}
