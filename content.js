(() => {
  'use strict';
  if (window.__coursePilotLoaded) return;
  window.__coursePilotLoaded = true;
  const C = globalThis.CoursePilot;
  const sessionKey = 'course-pilot-session-v1';
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch {}
  let enabled = saved?.enabled === true;
  let course = saved?.course || null;
  let config = C.settings();
  let current = '';
  let entered = Date.now();
  let endedAt = 0;
  let readAt = 0;
  let nextAt = 0;
  let nextAttempts = 0;
  let engineBusy = false;
  let engineState = null;
  let engineGeneration = 0;
  let lastEngine = 0;
  let pollSkipped = 0;
  let status = 'Ready. Open a lesson and press Start.';
  let panel;
  function persist() { sessionStorage.setItem(sessionKey, JSON.stringify({ enabled, course })); }
  function say(message) {
    status = message;
    if (panel) panel.querySelector('[data-status]').textContent = message;
  }
  function restoreVideo() {
    engineGeneration++;
    engineState = null;
    chrome.runtime.sendMessage({ type: 'engine', config: { enabled: false } }).catch(() => {});
  }
  function stop(message = 'Stopped. External speed settings are unchanged; any CourseraPilot speed override is released.') {
    enabled = false;
    persist();
    restoreVideo();
    say(message);
  }
  function syncEngine() {
    if (engineBusy || Date.now() - lastEngine < 1000) return;
    engineBusy = true;
    lastEngine = Date.now();
    const generation = engineGeneration;
    chrome.runtime.sendMessage({ type: 'engine', config: { ...config, enabled: true } })
      .then(result => { if (generation === engineGeneration) engineState = result; })
      .catch(error => { if (generation === engineGeneration) engineState = { error: error.message }; })
      .finally(() => { engineBusy = false; });
  }
  function skipPoll() {
    if (Date.now() - pollSkipped < 5000) return false;
    const candidates = controls(value => /^(?:skip|skip question|skip poll)$/.test(C.label(value)));
    const button = candidates.find(element => {
      let parent = element.parentElement;
      for (let depth = 0; parent && depth < 6; depth++, parent = parent.parentElement) {
        if (parent.matches('main, body, nav, aside')) break;
        const text = C.label(parent.textContent);
        if (text.length < 1800 && /\bpoll\b/.test(text) && !/graded|assignment|exam/.test(text)) return true;
      }
      return false;
    });
    if (!button) return false;
    pollSkipped = Date.now(); button.click();
    say('Skipped optional in-video poll. Resuming playback…');
    return true;
  }
  function visible(element) {
    const style = getComputedStyle(element);
    return element.getClientRects().length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }
  function controls(predicate) {
    return [...document.querySelectorAll('button, a[href], [role="button"]')].filter(element =>
      !element.closest('#course-pilot-panel') && visible(element) && !element.disabled &&
      element.getAttribute('aria-disabled') !== 'true' &&
      [element.textContent, element.getAttribute('aria-label'), element.getAttribute('title')].some(predicate));
  }
  function advance() {
    if (!config.autoNext) return say('Lesson finished. Auto-next is off.');
    if (nextAt && Date.now() - nextAt < 12000) return say('Waiting for the next lesson to load…');
    if (nextAttempts >= 2) return stop('Navigation did not finish. Open the next lesson and press Start.');
    const candidates = controls(C.nextLabel).filter(element => {
      if (!element.href) return true;
      const target = new URL(element.href, location.href);
      return target.origin === location.origin && C.route(target.href).course === course && C.route(target.href).key !== current;
    });
    if (!candidates.length) return say('Lesson finished. Waiting for a Next lesson button. If the course is finished, press Stop.');
    // Avoid ambiguous controls, such as quiz pagination or multiple unrelated Next buttons.
    if (candidates.length > 1) return say('Several Next buttons found. Choose the next lesson manually.');
    nextAt = Date.now();
    nextAttempts++;
    candidates[0].click();
    say('Opening the next lesson…');
  }
  function tick() {
    if (!enabled) return;
    const page = C.route(location.href);
    if (page.course !== course) return stop('Stopped because you left the selected course.');
    if (page.key !== current) {
      restoreVideo();
      current = page.key;
      entered = Date.now();
      endedAt = readAt = nextAt = nextAttempts = 0;
    }
    if (page.kind === 'manual') return stop('This page needs your input. Complete it, open the next lesson, and press Start.');
    if (CoursePilotDOM.completion(document, location.href)) {
      restoreVideo();
      return advance();
    }
    if (page.kind === 'reading') {
      if (!config.autoRead) return say('Reading open. Automatic reading completion is off.');
      const remaining = Math.ceil(config.readingSeconds - (Date.now() - entered) / 1000);
      if (remaining > 0) return say(`Reading: marking complete in ${remaining}s.`);
      const buttons = controls(C.readLabel);
      if (!readAt && buttons.length === 1) {
        readAt = Date.now();
        buttons[0].click();
        return say('Marked reading complete. Waiting for the page to update…');
      }
      if (readAt && Date.now() - readAt < 8000) return;
      if (readAt && buttons.length) return say('Waiting for Coursera to acknowledge the reading. Check the page if this persists.');
      return say('Waiting for Coursera to show this reading as completed.');
    }
    if (skipPoll()) return;
    syncEngine();
    const state = engineState;
    if (!state) return say('Connecting independent speed controller…');
    if (state.error) return say(`Controller: ${state.error}`);
    if (!state.found) return say(`No video detected in ${state.frames || 0} accessible frames. Open the video player.`);
    if (state.duration > 0 && Number.isFinite(state.duration) && state.currentTime / state.duration >= config.advanceAt / 100) {
      return advance();
    }
    if (state.ended) {
      if (!endedAt) endedAt = Date.now();
      if (Date.now() - endedAt < 8000) return say('Video ended. Allowing time for progress to save…');
      return say('Video ended. Waiting for Coursera to confirm completion before advancing.');
    }
    endedAt = 0;
    if (!state.duration) return say('Video found. Waiting for duration…');
    if (state.paused) return say('Video paused. Press Play or handle the prompt shown by Coursera.');
    const percent = Math.floor(state.currentTime / state.duration * 100);
    const measured = state.measured == null ? 'measuring…' : `${state.measured}× measured`;
    const mode = config.externalSpeed ? `External speed control${percent >= config.threshold ? ' · set external speed to 300% for the final section' : ''}` : `Switch at ${config.threshold}%.`;
    say(`Video ${percent}% · native ${state.rate}× · ${measured}. ${mode} · Next at ${config.advanceAt}%.`);
  }
  function mount() {
    const host = document.createElement('div');
    host.id = 'course-pilot-panel';
    panel = host.attachShadow({ mode: 'open' });
    panel.innerHTML = `<style>:host{position:fixed;right:18px;bottom:18px;z-index:2147483647;font:13px/1.5 system-ui;color:#f5f7ff}section{width:285px;padding:16px;background:#14213b;border:1px solid #536382;border-radius:14px;box-shadow:0 8px 30px #0004}header{display:flex;justify-content:space-between;align-items:center}strong{font-size:15px}button{border:0;border-radius:7px;padding:6px 12px;cursor:pointer;background:#fff;color:#14213b}p{margin:10px 0 0}</style><section><header><div><strong>CourseraPilot</strong><br><small>by Vedhant Khajuria</small></div><button>Stop</button></header><p data-status></p></section>`;
    panel.querySelector('button').addEventListener('click', () => stop());
    document.documentElement.appendChild(host);
    say(status);
  }
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === 'status') respond({ enabled, status, config, version: '1.5.1', diagnostics: engineState });
    else if (message.type === 'start') {
      config = C.settings(message.config);
      course = C.route(location.href).course;
      enabled = true;
      current = '';
      persist();
      tick();
      respond({ enabled, status });
    } else if (message.type === 'stop') { stop(); respond({ enabled, status }); }
  });
  mount();
  chrome.storage.local.get('settings').then(result => { config = C.settings(result.settings); tick(); });
  setInterval(tick, 500);
})();
