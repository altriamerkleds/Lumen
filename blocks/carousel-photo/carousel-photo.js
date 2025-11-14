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

  // Max starting index so we always have up to slidesPerView items in view
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
    // Only left mouse / touch / pen
    if (e.button !== undefined && e.button !== 0) return;

    isDragging = true;
    startX = e.clientX;
    currentX = startX;

    // Disable transition while dragging
    slidesWrapper.style.transition = 'none';

    // Prevent native image drag
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

    const currentOffset = -baseOffset + deltaX;
    slidesWrapper.style.transform = `translateX(${currentOffset}px)`;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = currentX - startX;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const threshold = (slideWidth + SLIDE_GAP) * 0.2; // 20% of slide

    let index = getCurrentIndex();

    if (deltaX > threshold) {
      index -= 1; // swipe right → previous
    } else if (deltaX < -threshold) {
      index += 1; // swipe left → next
    }

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    showSlide(block, index);
  };

  slidesWrapper.addEventListener('pointerdown', onPointerDown);
}

/* ========== DOT / BULLET EVENTS ========== */
function bindBulletEvents(block) {
  const bullets = block.querySelectorAll('.carousel-bullet');
  bullets.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      showSlide(block, idx);
    });
  });
}

/* ========== RESPONSIVE LAYOUT ========== */
function applyLayout(block) {
  const slidesWrapper = block.querySelector('.carousel-slides');
  const slides = block.querySelectorAll('.carousel-slide');
  const slidesPerView = getSlidesPerView();

  if (!slidesWrapper || !slides.length) return;

  const totalGap = SLIDE_GAP * (slidesPerView - 1);

  slidesWrapper.style.display = 'flex';
  slidesWrapper.style.gap = `${SLIDE_GAP}px`;
  slidesWrapper.style.willChange = 'transform';

  slides.forEach((slide) => {
    slide.style.flex = `0 0 calc((100% - ${totalGap}px) / ${slidesPerView})`;
  });
}

/* ========== MAIN DECORATE FUNCTION ========== */
export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();

  block.classList.add('carousel-photo');
  block.dataset.activeSlide = 0;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  // Wrap existing slides
  const originalSlides = Array.from(block.children);
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'carousel-slides';

  originalSlides.forEach((slide) => {
    slide.classList.add('carousel-slide');
    slidesWrapper.append(slide);

    // Disable native drag on images
    const imgs = slide.querySelectorAll('img');
    imgs.forEach((img) => {
      img.draggable = false;
    });
  });

  const container = document.createElement('div');
  container.className = 'carousel-container';
  container.append(slidesWrapper);

  block.innerHTML = '';
  block.append(container);

  container.style.position = 'relative';
  container.style.overflow = 'hidden'; // viewport

  // ===== Bullet navigation (dots) =====
  const slides = slidesWrapper.querySelectorAll('.carousel-slide');
  const slidesPerView = getSlidesPerView();
  const totalViews = Math.max(1, slides.length - slidesPerView + 1);

  const nav = document.createElement('div');
  nav.className = 'carousel-nav';

  for (let i = 0; i < totalViews; i += 1) {
    const bullet = document.createElement('button');
    bullet.className = `carousel-bullet${i === 0 ? ' active' : ''}`;
    bullet.setAttribute(
      'aria-label',
      `${placeholders.showSlide || 'Show Slide'} ${i + 1}`,
    );
    nav.append(bullet);
  }

  container.append(nav);

  // Layout + behaviour
  applyLayout(block);
  showSlide(block, 0);
  bindBulletEvents(block);
  bindSwipe(block);

  // Recalculate on resize (layout + snapping)
  window.addEventListener('resize', () => {
    applyLayout(block);
    const active = parseInt(block.dataset.activeSlide, 10) || 0;
    showSlide(block, active);
  });
}
