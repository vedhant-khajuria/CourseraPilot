'use strict';
const fields = ['fast', 'slow', 'threshold', 'advanceAt', 'externalSpeed', 'readingSeconds', 'autoNext', 'autoRead'];
const statusElement = document.querySelector('#status');
async function send(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !/^https?:\/\//.test(tab.url)) throw new Error('Open a normal website with a video. Chrome internal pages cannot be controlled.');
  const courseSite = /^https:\/\/(?:[\w-]+\.)?coursera\.org\//.test(tab.url);
  if (courseSite && !/^https:\/\/(?:[\w-]+\.)?coursera\.org\/learn\//.test(tab.url)) throw new Error('Open a Coursera video or reading lesson first.');
  document.querySelector('#course-settings').hidden = !courseSite;
  document.querySelector('button[type="submit"]').textContent = courseSite ? 'Start this course' : 'Start speed control';
  const type = value => courseSite ? value : `speed-${value}`;
  try {
    let status;
    try { status = await chrome.tabs.sendMessage(tab.id, { type: type('status') }); }
    catch {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: courseSite ? ['core.js', 'lesson-state.js', 'content.js'] : ['speed-only.js'] });
      status = await chrome.tabs.sendMessage(tab.id, { type: type('status') });
    }
    if (status?.version !== '1.5.1') throw new Error('Refresh this website tab to load the updated controller, then press Start again.');
    return message.type === 'status' ? status : await chrome.tabs.sendMessage(tab.id, { ...message, type: type(message.type) });
  }
  catch (error) { throw new Error(`v1.5.1: ${error.message}`); }
}
chrome.storage.local.get('settings').then(({ settings }) => {
  const config = CoursePilot.settings(settings);
  for (const key of fields) {
    const input = document.getElementById(key);
    if (input.type === 'checkbox') input.checked = config[key];
    else input.value = config[key];
  }
});
send({ type: 'status' }).then(result => { statusElement.textContent = result.status; }).catch(error => { statusElement.textContent = error.message; });
setInterval(() => {
  send({ type: 'status' }).then(result => { statusElement.textContent = result.status; }).catch(error => { statusElement.textContent = error.message; });
}, 1500);
document.querySelector('form').addEventListener('submit', async event => {
  event.preventDefault();
  const config = {};
  for (const key of fields) {
    const input = document.getElementById(key);
    config[key] = input.type === 'checkbox' ? input.checked : Number(input.value);
  }
  try {
    await chrome.storage.local.set({ settings: config });
    const result = await send({ type: 'start', config });
    statusElement.textContent = result.status;
    if (result.enabled) await chrome.tabs.create({ url: 'https://github.com/vedhant-khajuria', active: true });
  } catch (error) { statusElement.textContent = error.message; }
});
document.querySelector('#stop').addEventListener('click', async () => {
  try { statusElement.textContent = (await send({ type: 'stop' })).status; }
  catch (error) { statusElement.textContent = error.message; }
});
