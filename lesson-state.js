(function (root) {
  'use strict';
  const C = root.CoursePilot;
  const completedLabel = value => /^(?:(?:item|lesson|video|reading)\s*[:\-]?\s*)?(?:complete|completed|done)(?:\s+(?:item|lesson|video|reading))?$/.test(C.label(value));
  function marked(element) {
    if (element.getAttribute('data-completed') === 'true') return true;
    return /^(?:CheckCircle(?:Outline|Outlined)?|Check|Completed|Checkmark)(?:Icon)?$/i.test(element.getAttribute('data-testid') || '')
      || ['aria-label', 'title', 'alt', 'data-status', 'data-state'].some(key => completedLabel(element.getAttribute(key)))
      || completedLabel(element.textContent);
  }
  function completion(document, url) {
    const current = C.route(url).key;
    const links = [...document.querySelectorAll('a[href]')];
    // Only inspect the row for this exact lesson, never an entire module's checkmarks.
    for (const link of links) {
      let target;
      try { target = new URL(link.href, url); } catch { continue; }
      if (target.origin !== new URL(url).origin || C.route(target.href).key !== current) continue;
      let row = link.closest('li, [role="listitem"], [data-testid="item-row"]') || link;
      // Coursera also uses div-based rows with the completion icon beside the anchor.
      if (row === link) {
        for (let depth = 0; depth < 3 && row.parentElement; depth++) {
          const parent = row.parentElement;
          if (parent.matches('nav, aside, main, body') || parent.querySelectorAll('a[href]').length !== 1) break;
          row = parent;
        }
      }
      const lessonKeys = new Set([...row.querySelectorAll('a[href]')].map(item => {
        try { return C.route(new URL(item.href, url).href); } catch { return {}; }
      }).filter(item => item.kind === 'video' || item.kind === 'reading').map(item => item.key));
      if (lessonKeys.size > 1) continue;
      if ([row, link, ...row.querySelectorAll('[aria-label], [title], [alt], [data-testid], [data-status], [data-state], [data-completed]')].some(marked)) return true;
    }
    // Explicit completion controls belong to the lesson content, not the sidebar.
    const main = document.querySelector('main, [role="main"]');
    if (!main) return false;
    return [...main.querySelectorAll('button, [role="checkbox"], [data-testid="item-completion-status"], [data-testid="completion-status"]')]
      .filter(element => !element.closest('nav, aside, [role="navigation"]') && element.getClientRects().length > 0)
      .some(element => {
        const label = C.label(element.getAttribute('aria-label') || element.textContent);
        return /^(?:mark as (?:incomplete|unread)|completed|marked as (?:read|completed))$/.test(label)
          || (element.getAttribute('aria-checked') === 'true' && C.readLabel(label));
      });
  }
  function findVideo(document, visible) {
    const videos = [...document.querySelectorAll('video')];
    // Some players style the media element itself as hidden underneath a wrapper.
    return videos.find(video => !video.paused && !video.ended && video.duration > 0)
      || videos.find(visible) || (videos.length === 1 ? videos[0] : null);
  }
  root.CoursePilotDOM = { completion, completedLabel, findVideo };
  if (typeof module !== 'undefined') module.exports = root.CoursePilotDOM;
})(globalThis);
