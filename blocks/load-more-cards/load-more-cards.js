export default function decorate(block) {
  const cards = [...block.children];
  const cardsPerLoad = 3;
  let visibleCount = cardsPerLoad;

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
