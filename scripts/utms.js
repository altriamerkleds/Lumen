
const DEFAULT_CONFIG = {
  eightfoldHostname: 'careers.lumen.com',
  eightfoldPathPrefix: '/careers',
  observeMutations: true,
  mutationDebounceMs: 250,
  utmWhitelist: null, 
};

function getIncomingUtms(config = DEFAULT_CONFIG) {
  const params = new URLSearchParams(window.location.search);
  const utms = {};
  for (const [k, v] of params.entries()) {
    if (!v) continue;
    if (config.utmWhitelist) {
      if (config.utmWhitelist.includes(k)) utms[k] = v;
    } else if (k.toLowerCase().startsWith('utm_')) {
      utms[k] = v;
    }
  }
  return Object.keys(utms).length ? utms : null;
}

function isEightfoldUrl(urlObj, config) {
  // hostname exact match and path prefix match
  if (!urlObj) return false;
  if (urlObj.hostname !== config.eightfoldHostname) return false;
  return urlObj.pathname.startsWith(config.eightfoldPathPrefix);
}

function anchorHasAnyUtm(urlObj) {
  for (const key of urlObj.searchParams.keys()) {
    if (key.toLowerCase().startsWith('utm_')) return true;
  }
  return false;
}

function appendUtmsToHref(href, utms) {
  try {
    const url = new URL(href, window.location.href);
    for (const [k, v] of Object.entries(utms)) {
      if (!url.searchParams.has(k)) {
        url.searchParams.append(k, v);
      }
    }
    return url.toString();
  } catch (e) {
    // invalid URL — return original
    return href;
  }
}

function processAnchor(aEl, utms, config) {
  if (!aEl || !aEl.getAttribute) return;
  const rawHref = aEl.getAttribute('href');
  if (!rawHref) return;
  const trimmed = rawHref.trim();

  // ignore non-http links and anchors
  if (trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return;

  let url;
  try {
    url = new URL(trimmed, window.location.href);
  } catch {
    return;
  }

  if (!isEightfoldUrl(url, config)) return;

  const forceKeep = aEl.getAttribute('data-keep-utms') === 'true';
  if (!forceKeep && anchorHasAnyUtm(url)) return;
  // append and set back only if changed
  const newHref = appendUtmsToHref(trimmed, utms);
  if (newHref !== aEl.href) {
    aEl.setAttribute('href', newHref);
  }
}

export default function applyStickyUtms(userConfig = {}) {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const utms = getIncomingUtms(config);
  if (!utms) {
    return { disconnect: () => {} };
  }

  const processAllAnchors = () => {
    // find anchors once and process
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    anchors.forEach((a) => processAnchor(a, utms, config));
  };

  try {
    processAllAnchors();
  } catch (e) {
    console.error('applyStickyUtms initial run error', e);
  }

  let observer = null;
  if (config.observeMutations && typeof MutationObserver !== 'undefined') {
    let timeout = null;
    observer = new MutationObserver((mutations) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        try {
          const nodes = [];
          mutations.forEach((m) => {
            if (m.addedNodes && m.addedNodes.length) {
              m.addedNodes.forEach((n) => nodes.push(n));
            }
          });
          if (nodes.length === 0) {
            processAllAnchors();
          } else {
            nodes.forEach((node) => {
              if (node.nodeType !== 1) return;
              if (node.matches && node.matches('a[href]')) {
                processAnchor(node, utms, config);
              }
              const nested = node.querySelectorAll && node.querySelectorAll('a[href]');
              if (nested && nested.length) {
                nested.forEach((a) => processAnchor(a, utms, config));
              }
            });
          }
        } catch (err) {
          console.error('applyStickyUtms observer processing error', err);
        }
      }, config.mutationDebounceMs);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
  return {
    disconnect: () => {
      if (observer) observer.disconnect();
    },
    config,
    utms,
  };
}
