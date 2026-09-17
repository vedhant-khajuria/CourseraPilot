(() => {
  'use strict';
  if (globalThis.__coursePilotEngine?.version === '1.5.1') return;
  const descriptors = Object.fromEntries(['playbackRate', 'defaultPlaybackRate'].map(key => [key, Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, key)]));
  const closedRoots = new WeakMap();
  const attach = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (options) {
    const root = attach.call(this, options);
    closedRoots.set(this, root);
    return root;
  };
  let config = null, lastCommand = 0, media = null, original = null, own = null;
  let sample = null, measured = null, lastRate = null, playAttempt = 0, error = '';
  let detected = 0;
  let controlling = false;
  const nativeRate = () => descriptors.playbackRate.get.call(media);
  // Stop rate-reset listeners only for the video actively controlled by this extension.
  // Other media events, including progress tracking, continue normally.
  document.addEventListener('ratechange', event => {
    if (controlling && config && event.composedPath()[0] === media) {
      event.stopImmediatePropagation();
      update();
    }
  }, true);
  document.addEventListener('timeupdate', event => {
    if (config && event.composedPath()[0] === media) update();
  }, true);
  function release() {
    if (media && controlling) {
      for (const [key, descriptor] of Object.entries(descriptors)) {
        try {
          if (own[key]) Object.defineProperty(media, key, own[key]); else delete media[key];
          descriptor.set.call(media, original[key]);
        } catch {}
      }
    }
    media = original = own = sample = measured = lastRate = null;
    controlling = false;
  }
  function discover(root, output = []) {
    output.push(...root.querySelectorAll('video'));
    for (const element of root.querySelectorAll('*')) {
      const shadow = element.shadowRoot || closedRoots.get(element);
      if (shadow) discover(shadow, output);
    }
    return output;
  }
  function desired() {
    return media.duration > 0 && Number.isFinite(media.duration) && media.currentTime / media.duration < config.threshold / 100 ? config.fast : config.slow;
  }
  function bind(next) {
    release(); media = next; own = {}; original = {};
    controlling = !config.externalSpeed;
    if (!controlling) return;
    for (const [key, descriptor] of Object.entries(descriptors)) {
      original[key] = descriptor.get.call(media);
      own[key] = Object.getOwnPropertyDescriptor(media, key);
      try { Object.defineProperty(media, key, { configurable: true, enumerable: descriptor.enumerable,
        get() { return descriptor.get.call(this); },
        set(value) { descriptor.set.call(this, config && this === media ? desired() : value); }
      }); } catch { /* Native setters below still enforce the speed. */ }
    }
  }
  function update() {
    if (!config || Date.now() - lastCommand > 5000) { config = null; release(); return; }
    if (!media?.isConnected) return;
    const rate = config.externalSpeed ? nativeRate() : desired();
    try {
      for (const descriptor of config.externalSpeed ? [] : Object.values(descriptors)) {
        if (Math.abs(descriptor.get.call(media) - rate) > 0.001) descriptor.set.call(media, rate);
      }
      error = '';
    } catch (exception) { error = `Browser rejected ${rate}×: ${exception.message}`; }
    const now = Date.now();
    // Measure timeline advancement, not just the requested setting.
    if (lastRate !== rate || media.paused || media.seeking || media.ended) { sample = null; measured = null; }
    lastRate = rate;
    if (!media.paused && !media.seeking && !media.ended) {
      if (!sample) sample = { time: media.currentTime, wall: now };
      if (now - sample.wall >= 2000) {
        const ratio = (media.currentTime - sample.time) / ((now - sample.wall) / 1000);
        measured = ratio >= 0 && ratio <= rate * 1.5 ? Math.round(ratio * 10) / 10 : null;
        sample = { time: media.currentTime, wall: now };
      }
    }
    if (config.autoPlay !== false && media.paused && !media.ended && now - playAttempt > 5000) {
      playAttempt = now;
      try { Promise.resolve(media.play()).catch(() => { error = 'Press Play once on the video to allow playback.'; }); }
      catch { error = 'Press Play once on the video to allow playback.'; }
    }
  }
  function report() {
    return { version: '1.5.1', detected, found: Boolean(media), rate: media ? nativeRate() : null,
      externalSpeed: Boolean(config?.externalSpeed), requested: media && config && !config.externalSpeed ? desired() : null, measured, currentTime: media?.currentTime || 0,
      duration: Number.isFinite(media?.duration) ? media.duration : 0, paused: media?.paused ?? true,
      ended: media?.ended ?? false, error };
  }
  function run(input) {
    if (!input?.enabled) { config = null; release(); return report(); }
    if (![input.fast, input.slow].every(value => Number.isFinite(value) && value >= 1 && value <= 16)
      || !Number.isFinite(input.threshold) || input.threshold < 1 || input.threshold > 99) return { error: 'Invalid speed settings.' };
    if (config && Boolean(config.externalSpeed) !== Boolean(input.externalSpeed)) release();
    config = input; lastCommand = Date.now();
    const videos = discover(document);
    detected = videos.length;
    const next = videos.find(video => !video.paused && !video.ended && video.duration > 0)
      || (videos.includes(media) ? media : null)
      || videos.find(video => video.getClientRects().length && video.duration > 0) || videos[0];
    if (next && next !== media) bind(next);
    if (!next) release();
    update(); return report();
  }
  globalThis.__coursePilotEngine = { version: '1.5.1', run };
  setInterval(update, 100);
})();
