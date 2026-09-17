(() => {
  'use strict';
  // This script has no course navigation, completion, polling or assessment actions.
  if (/(^|\.)coursera\.org$/.test(location.hostname) || window.__courseraPilotSpeedOnly) return;
  window.__courseraPilotSpeedOnly = true;
  let enabled = false, busy = false, rate = 16, generation = 0;
  let status = 'Speed-only mode. Choose a speed and press Start speed control.';
  let panel;
  function say(value) { status = value; if (panel) panel.querySelector('p').textContent = value; }
  function stop() {
    enabled = false; generation++;
    chrome.runtime.sendMessage({ type: 'engine', config: { enabled: false } }).catch(() => {});
    say('Speed control stopped. Original speed restored.');
  }
  function mount() {
    if (panel) return;
    const host = document.createElement('div');
    panel = host.attachShadow({ mode: 'open' });
    panel.innerHTML = '<style>:host{position:fixed;right:18px;bottom:18px;z-index:2147483647;font:13px/1.5 system-ui;color:white}section{width:270px;background:#14213b;padding:15px;border-radius:12px;box-shadow:0 8px 30px #0004}button{float:right;border:0;border-radius:5px;padding:5px 9px;cursor:pointer}small{display:block;color:#c6d5ff}p{margin:12px 0 0}</style><section><button>Stop</button><strong>CourseraPilot</strong><small>Speed only · Vedhant Khajuria</small><p></p></section>';
    panel.querySelector('button').addEventListener('click', stop);
    document.documentElement.appendChild(host);
  }
  async function tick() {
    if (!enabled || busy) return;
    busy = true; const token = generation;
    try {
      const result = await chrome.runtime.sendMessage({ type: 'engine', config: { enabled: true, fast: rate, slow: rate, threshold: 70, externalSpeed: false, autoPlay: false } });
      if (token !== generation) return;
      say(result.error ? result.error : !result.found ? 'Waiting for a supported video. Press Play on the website.' :
        `${result.paused ? 'Paused' : 'Playing'} · native ${result.rate}× · ${result.measured == null ? 'measuring…' : result.measured + '× measured'}. Speed only; no page automation.`);
    } catch (error) { if (token === generation) say(error.message); }
    finally { busy = false; }
  }
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === 'speed-status') respond({ enabled, status, version: '1.5.1' });
    if (message.type === 'speed-start') {
      const value = Number(message.config?.fast);
      if (!Number.isFinite(value) || value < 1 || value > 16) { respond({ enabled: false, status: 'Choose a speed between 1× and 16×.' }); return; }
      rate = value; enabled = true; generation++; mount(); say(`Applying ${rate}× to videos in this tab…`); tick(); respond({ enabled, status });
    }
    if (message.type === 'speed-stop') { stop(); respond({ enabled, status }); }
  });
  setInterval(tick, 1000);
})();
