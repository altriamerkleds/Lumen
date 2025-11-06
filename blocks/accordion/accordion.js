/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  const detailsList = [];

  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';

    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);

    // keep track of all details
    detailsList.push(details);

    // replace row with details
    row.replaceWith(details);
  });

  // Add logic so only one can be open at a time
  detailsList.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        detailsList.forEach((other) => {
          if (other !== details) {
            other.removeAttribute('open');
          }
        });
      }
    });
  });
}
