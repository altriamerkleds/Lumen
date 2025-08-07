import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const getCardsPerSlide = () => {
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  const cardsPerSlide = getCardsPerSlide();

  const cards = Array.from(block.children).map((row) => {
    const cols = row.querySelectorAll('div');
    const card = document.createElement('div');
    card.className = 'carousel-card';

    const img = cols[0].querySelector('img');
    if (img) {
      const picture = createOptimizedPicture(img.src, img.alt || '', false, [{ width: 750 }]);
      card.appendChild(picture);
    }

    const content = document.createElement('div');
    content.className = 'carousel-content';
    content.append(...cols[1].children);
    card.appendChild(content);

    return card;
  });

  const carousel = document.createElement('div');
  carousel.className = 'carousel-container';

  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'carousel-slides';

  // Group cards into slides
  for (let i = 0; i < cards.length; i += cardsPerSlide) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    // Show last N cards if remaining cards are less than the group size
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

  // Add navigation
  const nav = document.createElement('div');
  nav.className = 'carousel-nav';

  const bullets = [];
  const slides = slidesWrapper.children;

  for (let i = 0; i < slides.length; i++) {
    const bullet = document.createElement('button');
    bullet.className = 'carousel-bullet';
    if (i === 0) bullet.classList.add('active');

    bullet.addEventListener('click', () => {
      Array.from(slides).forEach((slide) => {
        slide.style.transform = `translateX(-${i * 100}%)`;
      });
      bullets.forEach((b) => b.classList.remove('active'));
      bullet.classList.add('active');
    });

    nav.appendChild(bullet);
    bullets.push(bullet);
  }

  carousel.appendChild(nav);
  block.innerHTML = '';
  block.appendChild(carousel);
}
