import { createOptimizedPicture } from "../../scripts/aem.js";

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement("ul");
  [...block.children].forEach((row) => {
    const li = document.createElement("li");
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector("picture"))
        div.className = "cards-card-image";
      else div.className = "cards-card-body";
    });
    ul.append(li);
  });

  ul.querySelectorAll("picture > img").forEach((img) =>
    img
      .closest("picture")
      .replaceWith(
        createOptimizedPicture(img.src, img.alt, false, [{ width: "750" }])
      )
  );

  block.textContent = "";
  block.append(ul);

  /* Highlight last <strong> tag inside headings */
  document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    const strongTags = heading.querySelectorAll("strong");
    if (!strongTags.length) return;
    const lastStrong = strongTags[strongTags.length - 1];

    if (!lastStrong.querySelector(".highlight")) {
      const span = document.createElement("span");
      span.className = "highlight";
      span.innerHTML = lastStrong.innerHTML;
      lastStrong.innerHTML = "";
      lastStrong.appendChild(span);
    }
  });

  /* CTA To Open in New tab */
  
  block.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("http")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });

  /* Image Modal */

  const imgNodes = [...block.querySelectorAll(".cards-card-image img")];
  if (!imgNodes.length) return;

  const overlay = document.createElement("div");
  overlay.className = "cards-modal-overlay";

  overlay.innerHTML = `
    <div class="cards-modal">
      <span class="cards-modal-close"></span>
      <span class="cards-modal-arrow left"></span>
      <img class="cards-modal-main" src="">
      <span class="cards-modal-arrow right"></span>
      <div class="cards-modal-thumbs"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const mainImg = overlay.querySelector(".cards-modal-main");
  const closeBtn = overlay.querySelector(".cards-modal-close");
  const leftArrow = overlay.querySelector(".cards-modal-arrow.left");
  const rightArrow = overlay.querySelector(".cards-modal-arrow.right");
  const thumbsContainer = overlay.querySelector(".cards-modal-thumbs");

  let currentIndex = 0;

  imgNodes.forEach((img, idx) => {
    const indicator = document.createElement("div");
    indicator.dataset.index = idx;
    indicator.addEventListener("click", () => openModal(idx));
    thumbsContainer.appendChild(indicator);
  });

  const indicators = [...thumbsContainer.querySelectorAll("div")];

  function highlight() {
    indicators.forEach((ind) => ind.classList.remove("active"));
    indicators[currentIndex].classList.add("active");
  }

  // Remove highlight from all images
  function clearImageHighlights() {
    imgNodes.forEach((img) => {
      img.style.outline = "";
      img.style.outlineOffset = "";
    });
  }

  function openModal(index) {
    currentIndex = index;
    overlay.style.display = "flex";
    mainImg.src = imgNodes[index].src;

    highlight();
    document.body.classList.add("cards-modal-open");

    clearImageHighlights();
  }

  function closeModal() {
    overlay.style.display = "none";
    document.body.classList.remove("cards-modal-open");

    const lastImg = imgNodes[currentIndex];
    const lastLi = lastImg.closest("li");

    document.querySelectorAll(".cards.image-only ul li").forEach((li) => {
      li.style.outline = "";
      li.style.outlineOffset = "";
    });

    lastLi.style.outline = "2px dashed #3F4145";
    lastLi.style.outlineOffset = "6px";

    setTimeout(() => {
      lastLi.style.outline = "";
    }, 2000);
  }

  function nextImg() {
    currentIndex = (currentIndex + 1) % imgNodes.length;
    mainImg.src = imgNodes[currentIndex].src;
    highlight();
  }

  function prevImg() {
    currentIndex = (currentIndex - 1 + imgNodes.length) % imgNodes.length;
    mainImg.src = imgNodes[currentIndex].src;
    highlight();
  }

  // Click handlers
  imgNodes.forEach((img, index) => {
    img.addEventListener("click", () => openModal(index));
  });

  closeBtn.addEventListener("click", closeModal);
  rightArrow.addEventListener("click", nextImg);
  leftArrow.addEventListener("click", prevImg);
}
