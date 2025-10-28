export default function decorate(block) {
  const cards = [...block.children];
  const cardsPerLoad = 3;
  let visibleCount = cardsPerLoad;

  cards.forEach((card) => {
    const paragraphs = card.querySelectorAll('p');

    if (paragraphs[1]) {
      paragraphs[1].classList.add('job-location');
    }
    if (paragraphs[2]) {
      paragraphs[2].classList.add('job-category');
    }
    if (paragraphs[3]) {
      paragraphs[3].classList.add('job-description');
    }
  });

  // Function to show cards
  function renderCards() {
    cards.forEach((card, index) => {
      card.style.display = index < visibleCount ? 'block' : 'none';
      card.style.opacity = index < visibleCount ? 1 : 0;
    });
  }

  // Initial render
  renderCards();

  // Use existing “View More” button
  const viewMoreBtn = document.querySelector('.load-more-button .button.primary');
  if (!viewMoreBtn) return; // exit if button not found

  // Add click event
  viewMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (viewMoreBtn.textContent.trim().toUpperCase() === 'VIEW MORE') {
      visibleCount += cardsPerLoad;
      renderCards();

      // If all cards are visible
      if (visibleCount >= cards.length) {
        viewMoreBtn.textContent = 'VIEW LESS';
      }
    } else {
      visibleCount = cardsPerLoad;
      renderCards();
      viewMoreBtn.textContent = 'VIEW MORE';
    }
  });
}
