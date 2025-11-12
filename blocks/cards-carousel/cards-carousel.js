import { createOptimizedPicture } from "../../scripts/aem.js";

export default async function decorate(block) {
  if (!block.originalChildren) {
    block.originalChildren = Array.from(block.children).map((row) => {
      const cols = row.querySelectorAll('div');
      const img = cols[0]?.querySelector('img');
      return {
        img: img ? { src: img.src, alt: img.alt } : null,
        content: cols[1]?.cloneNode(true) || null,
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

    // Build cards
    const cards = block.originalChildren.map((cardData) => {
      const card = document.createElement('div');
      card.className = 'carousel-card';

      if (cardData.img) {
        const picture = createOptimizedPicture(
          cardData.img.src,
          cardData.img.alt || "",
          false,
          [{ width: 750 }]
        );
        card.appendChild(picture);
      }

      if (cardData.content) {
        const content = document.createElement('div');
        content.className = "carousel-content";
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
      slide.className = "carousel-slide";

      let group = cards.slice(i, i + cardsPerSlide);

      // If last slide has fewer cards, use cards from the end of previous slides
      if (group.length < cardsPerSlide) {
        const deficit = cardsPerSlide - group.length;
        const startIndex = cards.length - cardsPerSlide; // pick last full set
        group = cards.slice(startIndex, startIndex + cardsPerSlide);
      }

      // Append cloned cards to slide
      group.forEach((card) => slide.appendChild(card.cloneNode(true)));

      slidesWrapper.appendChild(slide);
    }

    carousel.appendChild(slidesWrapper);

    // Navigation
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    const slides = slidesWrapper.children;
    const bullets = [];

    Array.from(slides).forEach((slide, i) => {
      const bullet = document.createElement('button');
      bullet.className = 'carousel-bullet';
      if (i === activeSlideIndex) bullet.classList.add('active');

      bullet.addEventListener('click', () => {
        // Show only active slide
        Array.from(slides).forEach((s, idx) => {
          s.style.display = idx === i ? "flex" : "none";
        });

        bullets.forEach((b) => b.classList.remove('active'));
        bullet.classList.add('active');
        activeSlideIndex = i;

        normalizeSlideHeights();
      });

      nav.appendChild(bullet);
      bullets.push(bullet);
    });

    carousel.appendChild(nav);

    block.innerHTML = "";
    block.appendChild(carousel);

    Array.from(slides).forEach((slide, i) => {
      slide.style.display = i === activeSlideIndex ? 'flex' : 'none';
    });

    normalizeSlideHeights();
  };

  const normalizeSlideHeights = () => {
    const slides = block.querySelectorAll('.carousel-slide');
    slides.forEach((slide) => {
      let maxHeight = 0;
      const contents = slide.querySelectorAll('.carousel-content');
      contents.forEach((c) => {
        c.style.height = "auto"; // reset first
        if (c.offsetHeight > maxHeight) maxHeight = c.offsetHeight;
      });
      contents.forEach((c) => (c.style.height = `${maxHeight}px`));
    });
  };

  const getBreakpoint = () => {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  };

  let currentBreakpoint = getBreakpoint();

  const handleResize = () => {
    const newBreakpoint = getBreakpoint();
    if (newBreakpoint !== currentBreakpoint) {
      const oldCardsPerSlide =
        currentBreakpoint === "desktop"
          ? 3
          : currentBreakpoint === "tablet"
          ? 2
          : 1;
      const firstCardIndex = activeSlideIndex * oldCardsPerSlide;

      currentBreakpoint = newBreakpoint;
      buildCarousel();
      const newCardsPerSlide =
        newBreakpoint === "desktop" ? 3 : newBreakpoint === "tablet" ? 2 : 1;
      activeSlideIndex = Math.floor(firstCardIndex / newCardsPerSlide);

      const slides = block.querySelectorAll(".carousel-slide");
      Array.from(slides).forEach((slide, idx) => {
        slide.style.display = idx === activeSlideIndex ? "flex" : "none";
      });

      const bullets = block.querySelectorAll(".carousel-bullet");
      bullets.forEach((b, idx) => {
        b.classList.toggle("active", idx === activeSlideIndex);
      });

      normalizeSlideHeights();
    }
  };

  buildCarousel();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 200);
  });
}
