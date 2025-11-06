import { loadVideoEmbed } from '../video/video.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'card-video-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'card-video-item';

    const videoCol = row.children[0];
    const bodyCol = row.children[1];

    if (videoCol) {
      videoCol.className = 'card-video-video';

      const link = videoCol.querySelector('a')?.href;
      const placeholder = videoCol.querySelector('picture');

      if (link) {
        videoCol.textContent = '';
        videoCol.dataset.embedLoaded = false;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'video-placeholder';

        if (placeholder) {
          wrapper.append(placeholder);
        }

        // Overlay play button
        const playWrapper = document.createElement('div');
        playWrapper.className = 'video-placeholder-play';
        const playBtn = document.createElement('button');
        playWrapper.append(playBtn);
        wrapper.append(playWrapper);

        playBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          wrapper.remove();
          loadVideoEmbed(videoCol, link, true, false);
        });
        wrapper.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          window.open(link, '_blank', 'noopener,noreferrer');
        });

        videoCol.append(wrapper);
      }
    }

    if (bodyCol) {
      bodyCol.className = 'card-video-body';
      li.append(videoCol, bodyCol);
    } else if (videoCol) {
      li.append(videoCol);
    }

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
