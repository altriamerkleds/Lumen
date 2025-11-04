export default function decorate(block) {
  const cards = [...block.children];
  const cardsPerLoad = 3;
  let visibleCount = cardsPerLoad;

  // Add helpful classes to card contents
  cards.forEach((card) => {
    const paragraphs = card.querySelectorAll('p');
    if (paragraphs[1]) paragraphs[1].classList.add('job-location');
    if (paragraphs[2]) paragraphs[2].classList.add('job-category');
    if (paragraphs[3]) paragraphs[3].classList.add('job-description');
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

  // Create button structure
  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('load-more-button'); // main wrapper

  const buttonContainer = document.createElement('p');
  buttonContainer.classList.add('button-container');

  const strongEl = document.createElement('strong');
  const linkEl = document.createElement('a');

  linkEl.href = '#';
  linkEl.title = 'VIEW MORE';
  linkEl.classList.add('button', 'primary');
  linkEl.textContent = 'VIEW MORE';

  strongEl.appendChild(linkEl);
  buttonContainer.appendChild(strongEl);
  buttonWrapper.appendChild(buttonContainer);

  // Append AFTER the grid (outside card block)
  block.parentElement.appendChild(buttonWrapper);

  // Add click event
  linkEl.addEventListener('click', (e) => {
    e.preventDefault();

    if (linkEl.textContent.trim().toUpperCase() === 'VIEW MORE') {
      visibleCount += cardsPerLoad;
      renderCards();

      if (visibleCount >= cards.length) {
        visibleCount = cards.length;
        renderCards();
        linkEl.textContent = 'VIEW LESS';
        linkEl.title = 'VIEW LESS';
      }
    } else {
      visibleCount = cardsPerLoad;
      renderCards();
      linkEl.textContent = 'VIEW MORE';
      linkEl.title = 'VIEW MORE';
    }
  });
}
