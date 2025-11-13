import { fetchPlaceholders } from '../../scripts/placeholders.js';

/* ========== SLIDE CONTROL ========== */
function updateActiveSlide(block, activeIndex) {
  const slides = block.querySelectorAll('.carousel-slide');
  const bullets = block.querySelectorAll('.carousel-bullet');

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === activeIndex);
    slide.setAttribute('aria-hidden', idx !== activeIndex);
  });

  bullets.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === activeIndex);
  });

  block.dataset.activeSlide = activeIndex;
}

function showSlide(block, newIndex) {
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;

  let index = newIndex;
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;

  const slideWidth = slides[0].offsetWidth;
  const slidesWrapper = block.querySelector('.carousel-slides');

  slidesWrapper.style.transform = `translateX(-${index * slideWidth}px)`;
  slidesWrapper.style.transition = 'transform 0.6s ease-in-out';

  updateActiveSlide(block, index);
}

function bindEvents(block) {
  const bullets = block.querySelectorAll('.carousel-bullet');
  bullets.forEach((btn, idx) => {
    btn.addEventListener('click', () => showSlide(block, idx));
  });
}

/* ========== MAIN DECORATE FUNCTION ========== */
export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();

  block.classList.add('carousel-teaser');
  block.dataset.activeSlide = 0;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  // Wrap existing slides
  const slides = Array.from(block.children);
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'carousel-slides';

  slides.forEach((slide) => {
    slide.classList.add('carousel-slide');
    slidesWrapper.append(slide);
  });

  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.append(slidesWrapper);

  block.innerHTML = '';
  block.append(container);

  // Add bullet navigation only
  const bulletNav = document.createElement('div');
  bulletNav.className = 'carousel-nav';
  slides.forEach((_, i) => {
    const bullet = document.createElement('button');
    bullet.className = `carousel-bullet${i === 0 ? ' active' : ''}`;
    bullet.setAttribute('aria-label', `${placeholders.showSlide || 'Show Slide'} ${i + 1}`);
    bulletNav.append(bullet);
  });
  container.append(bulletNav);

  // Initialize
  showSlide(block, 0);
  bindEvents(block);

  // Recalculate on resize
  window.addEventListener('resize', () => {
    const active = parseInt(block.dataset.activeSlide, 10) || 0;
    showSlide(block, active);
  });
}
