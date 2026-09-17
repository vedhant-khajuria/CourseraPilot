# CourseraPilot · v1.5.1

## New: browser-wide speed controller, Coursera-only course automation

On an ordinary HTTP/HTTPS website, open the extension, choose a playback speed, and press **Start speed control**. This applies a constant speed to a supported video in that tab; it does not click Next, mark readings, skip polls, or start paused videos. Press Play on the website yourself. Stop restores the original speed. Leaving or reloading the page ends the general speed-only session.

On Coursera lesson pages, the full course controls remain available: 16× before 70%, 3× afterwards, and auto-next at 96%. For existing settings, **uncheck “Use my external speed extension instead”** to enable the built-in controller. Disable competing speed extensions for that tab. Built-in mode is the default for fresh settings.

Chrome will request access to HTTP/HTTPS websites so the speed controller can operate there, including accessible embedded frames. Course navigation scripts remain restricted to Coursera. Chrome internal pages, the Chrome Web Store, and unsupported/custom media players cannot be controlled. Speed-only sessions are opt-in per tab, not an automatic speed change across all open tabs.

The controller now executes in Chrome's isolated extension environment and intercepts speed-reset events only for the video it controls. Other media events remain available. Do not assume universal compatibility; browser support, buffering, and page-specific behavior can affect playback.

Created by **Vedhant Khajuria**. An independent Chrome extension for Coursera video and reading navigation.

- Creator: https://github.com/vedhant-khajuria
- Project and downloads: https://github.com/vedhant-khajuria/courserapilot

## Install or update

1. Extract **CourseraPilot-extension.zip** into a permanent folder.
2. Open `chrome://extensions` in Chrome 119 or newer. Turn on **Developer mode**.
3. Choose **Load unpacked** and select the extracted folder containing manifest.json. If already installed, replace the old files and click Reload instead.
4. Refresh your Coursera tab, open a video or reading lesson, then open **CourseraPilot**.
5. Choose settings and press **Start this course**. Each successful Start opens Vedhant Khajuria's GitHub profile in a new tab. Your course tab remains open and continues running. Status checks, Stop, and automatic lesson changes do not open extra profile tabs.

## Playback and navigation

External speed mode is optional on Coursera. It leaves speed settings untouched so your existing speed extension can control them. Set that extension to **1600%** for 16× playback. Changing it to **300%** at 70% is manual in external mode; CourseraPilot does not remotely set the other extension's speed. Reset to 1600% on the next lesson as needed.

To use the built-in speed schedule, turn off external mode and disable the competing speed extension on this tab. Defaults are 16× before 70% and 3× afterwards. Compatibility varies by player; the built-in controller has not been verified in every Coursera course. The status panel reports native speed and measured timeline progression separately.

Auto-next opens the next lesson at **96%** by default. It does not wait for the video to end or Coursera to confirm credit. Change the threshold or turn off auto-next in the popup. Explicitly completed lessons are skipped immediately when a supported completion indicator is recognized.

Readings wait 15 seconds by default, use the visible Mark as read/complete control, and wait for a recognized completion indicator before advancing. Optional in-video polls with an explicit Skip button can be skipped. Quizzes, assignments and unsupported lesson pages require manual input; the extension does not answer or submit assessments.

## Controls and limits

Keep the course tab open and the computer awake. Press Play once if the browser blocks autoplay. The floating panel has a Stop button. External mode never restores or changes your externally chosen speed on Stop. Built-in mode releases its speed overrides and restores the previous rate.

English page labels and unambiguous Next buttons are supported. Missing controls, changed layouts, ambiguous navigation, device sleep, buffering and inaccessible third-party frames can require manual intervention. Navigation stays within the selected course. After a manual assessment, open the next supported lesson and press Start again.

Coursera decides completion credit. The 70%/96% strategy is user-configurable and does not guarantee lesson credit, course completion, or a certificate. CourseraPilot is not affiliated with, endorsed by or sponsored by Coursera.

## Privacy

Settings are stored locally in Chrome. Session state is stored in the course tab. No analytics, login collection or external telemetry is included. Course controls operate on Coursera; speed-only controls can operate on other HTTP/HTTPS websites when started. Clicking Start opens the creator's GitHub profile, which is subject to GitHub's own privacy practices.

## Developer verification

Release verification: 30 automated tests passed, covering speed changes, scope separation, navigation, external mode, and creator-profile behavior. A local browser media test verified acceleration, the 70% switch, reset resistance and restoration. This does not guarantee compatibility with every live course or player.

The separate **CourseraPilot-website.zip** contains the animated static website and its own publishing instructions. It is not automatically deployed.
