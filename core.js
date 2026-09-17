(function (root) {
  'use strict';
  const defaults = { fast: 16, slow: 3, threshold: 70, advanceAt: 96, externalSpeed: false, readingSeconds: 15, autoNext: true, autoRead: true };
  function settings(input = {}) {
    const number = (key, min, max) => Number.isFinite(Number(input[key]))
      ? Math.max(min, Math.min(max, Number(input[key]))) : defaults[key];
    return { fast: number('fast', 1, 16), slow: number('slow', 1, 16),
      threshold: number('threshold', 1, 99), advanceAt: number('advanceAt', 1, 100), externalSpeed: input.externalSpeed ?? false, readingSeconds: number('readingSeconds', 5, 600),
      autoNext: input.autoNext ?? true, autoRead: input.autoRead ?? true };
  }
  function route(url) {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const course = parts[0] === 'learn' ? parts[1] : null;
    const kind = parts[2] === 'lecture' ? 'video' : parts[2] === 'supplement' ? 'reading' : 'manual';
    return { course, kind, key: parts.slice(0, 4).join('/') };
  }
  function speed(time, duration, config) {
    if (!Number.isFinite(duration) || duration <= 0) return config.slow;
    return time / duration >= config.threshold / 100 ? config.slow : config.fast;
  }
  function label(value) { return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
  const nextLabel = value => /^(?:go to (?:the )?next(?: (?:item|lesson|video))?|next(?: (?:item|lesson|video))?|continue to next(?: (?:item|lesson|video))?)(?:\s*[→›»])?$/.test(label(value));
  const readLabel = value => /^(?:mark as (?:read|complete|completed)|mark (?:complete|completed))$/.test(label(value));
  const api = { defaults, settings, route, speed, label, nextLabel, readLabel };
  root.CoursePilot = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
