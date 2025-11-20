import { loadVideoEmbed } from "../video/video.js";

const preventAutoPlay = (url) =>
  url.replace(/(\?|&)autoplay=1/, "").replace(/(\?|&)mute=1/, "");

const enableAutoPlay = (url) =>
  url.includes("autoplay=1")
    ? url
    : `${url}${url.includes("?") ? "&" : "?"}autoplay=1`;

export default function decorate(block) {
  const ul = document.createElement("ul");
  ul.className = "card-video-list";

  [...block.children].forEach((row) => {
    const li = document.createElement("li");
    li.className = "card-video-item";

    const [videoCol, bodyCol] = row.children;

    if (videoCol) {
      videoCol.className = "card-video-video";

      const link = videoCol.querySelector("a")?.href;
      const placeholder = videoCol.querySelector("picture");

      if (link) {
        videoCol.textContent = "";
        videoCol.dataset.embedLoaded = false;

        /** YOUTUBE / VIMEO WITHOUT POSTER */

        if (!placeholder) {
          const embedWrapper = document.createElement("div");
          embedWrapper.className = "card-video-embed";

          loadVideoEmbed(embedWrapper, link, false, false);

          videoCol.append(embedWrapper);
        } else {

        /** POSTER EXISTS    */
          const wrapper = document.createElement("div");
          wrapper.className = "video-placeholder";
          wrapper.append(placeholder);

          const playWrapper = document.createElement("div");
          playWrapper.className = "video-placeholder-play";

          const playBtn = document.createElement("button");
          playWrapper.append(playBtn);
          wrapper.append(playWrapper);

          // Modal play click
          playBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openVideoModal(link);
          });

          videoCol.append(wrapper);
        }
      }
    }

    if (bodyCol) bodyCol.className = "card-video-body";

    li.append(videoCol, ...(bodyCol ? [bodyCol] : []));
    ul.append(li);
  });

  block.textContent = "";
  block.append(ul);
}

/* Modal Popup Handler */
function openVideoModal(videoUrl) {
  const overlay = document.createElement("div");
  overlay.className = "video-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "video-modal";

  const closeBtn = document.createElement("button");
  closeBtn.className = "video-modal-close";

  const videoContainer = document.createElement("div");
  videoContainer.className = "video-modal-content";

  modal.append(closeBtn, videoContainer);
  overlay.append(modal);
  document.body.append(overlay);

  loadVideoEmbed(videoContainer, preventAutoPlay(videoUrl), false, false);

  closeBtn.addEventListener("click", () => {
    overlay.remove();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  modal.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  overlay.addEventListener("remove", () => {
    const iframe = videoContainer.querySelector("iframe");
    if (iframe) {
      iframe.src = "";
    }
  });

  const observer = new MutationObserver(() => {
    if (!document.body.contains(overlay)) {
      const iframe = videoContainer.querySelector("iframe");
      if (iframe) iframe.src = "";
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });
}
