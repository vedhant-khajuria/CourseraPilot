'use strict';
const queues = new Map();
async function engine(tabId, config, retry = true) {
  const results = await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, world: 'ISOLATED',
    func: input => globalThis.__coursePilotEngine?.run(input) || { missing: true }, args: [config] });
  const missing = results.filter(frame => frame.result?.missing).map(frame => frame.frameId);
  if (missing.length && retry) {
    await chrome.scripting.executeScript({ target: { tabId, frameIds: missing }, world: 'ISOLATED', files: ['speed-controller.js'] });
    return engine(tabId, config, false);
  }
  const players = results.filter(frame => frame.result?.found);
  const best = players.find(frame => !frame.result.paused && !frame.result.ended) || players[0];
  return { ...(best?.result || { found: false }), frames: results.length,
    players: players.length, frameId: best?.frameId ?? null };
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.type !== 'engine') return;
  if (!sender.tab?.id || sender.frameId !== 0) { respond({ error: 'Controller requires the main course tab.' }); return; }
  const tabId = sender.tab.id;
  const work = (queues.get(tabId) || Promise.resolve()).catch(() => {}).then(() => engine(tabId, message.config));
  queues.set(tabId, work);
  work.then(respond).catch(error => respond({ error: error.message })).finally(() => { if (queues.get(tabId) === work) queues.delete(tabId); });
  return true;
});
