import { fetchPlaceholders } from '../../scripts/placeholders.js';

const SLIDE_GAP = 16; // px between slides

function getSlidesPerView() {
  const width = window.innerWidth;
  if (width >= 1024) return 3;      // Desktop
  if (width >= 768) return 2;       // Tablet
  return 1;                         // Mobile
}

/* ========== SLIDE CONTROL ========== */
function updateActiveSlide(block, activeIndex) {
  const slides = block.querySelectorAll('.carousel-slide');
  const bullets = block.querySelectorAll('.carousel-bullet');
  const slidesPerView = getSlidesPerView();

  slides.forEach((slide, idx) => {
    const isVisible = idx >= activeIndex && idx < activeIndex + slidesPerView;
    slide.classList.toggle('active', isVisible);
    slide.setAttribute('aria-hidden', !isVisible);
  });

  bullets.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === activeIndex);
  });

  block.dataset.activeSlide = activeIndex;
}

function showSlide(block, newIndex) {
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;

  const slidesWrapper = block.querySelector('.carousel-slides');
  const slidesPerView = getSlidesPerView();

  const maxIndex = Math.max(0, slides.length - slidesPerView);

  let index = newIndex;
  if (index < 0) index = maxIndex;
  if (index > maxIndex) index = 0;

  const firstSlide = slides[0];
  const slideWidth = firstSlide.getBoundingClientRect().width;
  const offset = index * (slideWidth + SLIDE_GAP);

  slidesWrapper.style.transition = 'transform 0.6s ease-in-out';
  slidesWrapper.style.transform = `translateX(-${offset}px)`;

  updateActiveSlide(block, index);
}

/* ========== SWIPE / DRAG SUPPORT ========== */
function bindSwipe(block) {
  const slidesWrapper = block.querySelector('.carousel-slides');
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slidesWrapper || !slides.length) return;

  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  const getCurrentIndex = () => parseInt(block.dataset.activeSlide, 10) || 0;

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    isDragging = true;
    startX = e.clientX;
    currentX = startX;

    slidesWrapper.style.transition = 'none';
    e.preventDefault();

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;

    currentX = e.clientX;
    const deltaX = currentX - startX;

    const slideWidth = slides[0].getBoundingClientRect().width;
    const index = getCurrentIndex();
    const baseOffset = index * (slideWidth + SLIDE_GAP);

    slidesWrapper.style.transform = `translateX(${ -baseOffset + deltaX }px)`;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = currentX - startX;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const threshold = (slideWidth + SLIDE_GAP) * 0.2;

    let index = getCurrentIndex();

    if (deltaX > threshold) index -= 1;
    else if (deltaX < -threshold) index += 1;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    showSlide(block, index);
  };

  slidesWrapper.addEventListener('pointerdown', onPointerDown);
}

/* ========== BUILD BULLETS on INIT + RESIZE ========== */
function rebuildBullets(block) {
  const nav = block.querySelector('.carousel-nav');
  nav.innerHTML = ''; // Clear existing bullets

  const slides = block.querySelectorAll('.carousel-slide');
  const slidesPerView = getSlidesPerView();
  const totalViews = Math.max(1, slides.length - slidesPerView + 1);

  for (let i = 0; i < totalViews; i += 1) {
    const bullet = document.createElement('button');
    bullet.className = `carousel-bullet${i === 0 ? ' active' : ''}`;
    bullet.setAttribute('aria-label', `Show Slide ${i + 1}`);
    nav.append(bullet);
  }

  // Bind click events again
  bindBulletEvents(block);
}

/* ========== DOT / BULLET EVENTS ========== */
function bindBulletEvents(block) {
  const bullets = block.querySelectorAll('.carousel-bullet');
  bullets.forEach((btn, idx) => {
    btn.addEventListener('click', () => showSlide(block, idx));
  });
}

/* ========== RESPONSIVE LAYOUT ========== */
function applyLayout(block) {
  const slidesWrapper = block.querySelector('.carousel-slides');
  const slides = block.querySelectorAll('.carousel-slide');
  const slidesPerView = getSlidesPerView();

  const totalGap = SLIDE_GAP * (slidesPerView - 1);
  slidesWrapper.style.display = 'flex';
  slidesWrapper.style.gap = `${SLIDE_GAP}px`;

  slides.forEach((slide) => {
    slide.style.flex = `0 0 calc((100% - ${totalGap}px) / ${slidesPerView})`;
  });
}

/* ========== MAIN DECORATE FUNCTION ========== */
export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();

  block.classList.add('carousel-photo');
  block.dataset.activeSlide = 0;

  // Wrap existing slides
  const originalSlides = Array.from(block.children);
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'carousel-slides';

  originalSlides.forEach((slide) => {
    slide.classList.add('carousel-slide');
    slidesWrapper.append(slide);
  });

  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.append(slidesWrapper);

  block.innerHTML = '';
  block.append(container);

  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  container.append(nav);

  applyLayout(block);
  rebuildBullets(block);
  showSlide(block, 0);

  bindSwipe(block);

  window.addEventListener('resize', () => {
    applyLayout(block);
    rebuildBullets(block);
    showSlide(block, 0);
  });
}
