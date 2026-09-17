<div align="center">

# 🚀 CourseraPilot

### Automate your Coursera. Take control of your playback.

A Chrome extension for fewer repetitive clicks, flexible video speeds, and smoother course navigation.

**Created by [Vedhant Khajuria](https://github.com/vedhant-khajuria)**

[![Version](https://img.shields.io/badge/version-1.5.1-254bff?style=for-the-badge)](https://github.com/vedhant-khajuria/courserapilot)
[![Chrome](https://img.shields.io/badge/Chrome-119%2B-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Website](https://img.shields.io/badge/Visit-Website-152022?style=for-the-badge&logo=netlify&logoColor=white)](https://courserapilot.netlify.app/)

[**Explore the Website**](https://courserapilot.netlify.app/) · [**Download Extension**](./CourseraPilot-extension.zip) · [**Report an Issue**](https://github.com/vedhant-khajuria/courserapilot/issues)

</div>

---

## ✨ What is CourseraPilot?

CourseraPilot helps you work through college-assigned Coursera courses, skill-development programs, and personal learning with fewer repetitive clicks. It combines **Coursera-only course automation** with an **opt-in video speed controller for other supported websites**.

You remain responsible for learning the material, completing assessments, and following the rules that apply to your course.

## 🎯 Two modes. Clear boundaries.

| Feature | Coursera lessons | Other supported websites |
| :--- | :---: | :---: |
| Built-in video speed control | ✅ | ✅ |
| Automatic 16× → 3× speed schedule | ✅ | — |
| Auto-next at 96% | ✅ | — |
| Skip lessons marked completed | ✅ | — |
| Reading completion controls | ✅ | — |
| Skip supported optional in-video polls | ✅ | — |
| On-page Stop button | ✅ | ✅ |

**Other websites use a constant speed that you choose.** They do not receive course automation, automatic navigation, or reading actions. Start speed control separately for each tab and press Play on the website yourself.

## ⚡ Default Coursera settings

| Setting | Default |
| :--- | :--- |
| Initial video speed | **16×** |
| Speed-switch point | **70%** of the video timeline |
| Final video speed | **3×** |
| Advance to the next lesson | **96%** of the video timeline |
| Reading delay | **15 seconds** |
| Speed mode for fresh settings | **Built-in controller** |

Adjust these settings in the extension popup. Existing saved preferences are preserved.

## 📦 Downloads

| Package | Contents |
| :--- | :--- |
| [**CourseraPilot-extension.zip**](./CourseraPilot-extension.zip) | Installable unpacked Chrome extension, icons, and instructions |
| [**CourseraPilot-website.zip**](./CourseraPilot-website.zip) | Responsive animated website, local assets, SEO metadata, and publishing instructions |

Prefer a preview? Visit **[courserapilot.netlify.app](https://courserapilot.netlify.app/)**.

## 🛠️ Install the extension

1. Download **CourseraPilot-extension.zip** and extract it into a permanent folder.
2. Open `chrome://extensions` in **Chrome 119 or later**.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
5. Refresh the website or Coursera lesson you want to use.
6. Open **CourseraPilot** from Chrome’s extensions menu.

> **Updating an existing installation?** Replace the files in the loaded folder, click **Reload** on the extension, and refresh your browser tabs.

## ▶️ Start a session

### On Coursera

1. Open a video or reading lesson.
2. Choose your speeds, switch point, and auto-next threshold.
3. For built-in speed control, leave **Use my external speed extension instead** unchecked.
4. Disable competing speed extensions for that tab, then click **Start this course**.
5. Keep the course tab open and use the on-page panel to monitor progress or stop.

Quizzes, assignments, and unsupported lesson pages require your input. After completing them, open the next supported lesson and start again.

### On another website

1. Open a supported video on an HTTP/HTTPS website.
2. Choose a playback speed between **1× and 16×**.
3. Click **Start speed control**, then play the video on the website.
4. Click **Stop** to release control and restore the previous speed.

Reloading or leaving the page ends the general speed-only session.

### Using an external speed extension

External speed mode is optional on Coursera and leaves your other extension’s speed settings untouched. Set **1600%** for 16× playback and manually change to **300%** at 70% if you want the final section at 3×. CourseraPilot does not remotely change the other extension’s settings.

## 🔒 Privacy, permissions & control

- **Local preferences:** Settings stay in Chrome; course session state stays in the course tab.
- **No built-in analytics:** CourseraPilot does not collect login details or include external telemetry.
- **Website access:** HTTP/HTTPS permissions let the speed controller find supported videos, including accessible embedded players.
- **Opt-in operation:** Other websites are not automatically accelerated. Start a session for the tab you want to control.
- **Coursera-only automation:** Navigation, reading controls, and poll skipping remain restricted to Coursera.
- **Creator link:** Every successful press of Start opens [Vedhant Khajuria’s GitHub profile](https://github.com/vedhant-khajuria) in a separate tab. Your original tab stays open. Status checks, Stop, and automatic lesson changes do not open extra profile tabs.

These safeguards do not guarantee account safety or approval under a platform’s or institution’s rules. GitHub visits are subject to GitHub’s own privacy practices.

## 💡 Troubleshooting

| Problem | What to check |
| :--- | :--- |
| Speed stays normal | Disable competing controllers, uncheck external mode on Coursera, reload the extension, and refresh the page. |
| Video will not play | Press Play once on the website; the browser may block autoplay. |
| Native speed is high but measured speed is low | Check buffering, a paused player, or an in-video prompt. A speed setting alone does not prove playback is advancing. |
| Next lesson does not open | Check for a missing, disabled, or ambiguous Next button, or a page requiring manual input. |
| Extension cannot access the page | Confirm site access. Chrome internal pages, the Chrome Web Store, and some custom players are unsupported. |
| A reading does not advance | Check its completion control. Readings wait for a recognized completion indicator. |

## 📌 Important limits

- **Coursera decides completion credit.** Leaving at 96% does not guarantee a lesson is credited.
- Course completion, certificates, and compatibility with every player are **not guaranteed**.
- The extension does not answer or submit quizzes, exams, projects, or assignments.
- Standard English labels and supported completion indicators are required for course automation.
- Page changes, inaccessible frames, device sleep, and browser throttling may interrupt a session.
- CourseraPilot is an **independent project**, not affiliated with, endorsed by, or sponsored by Coursera.

## 🌐 Website

**[https://courserapilot.netlify.app/](https://courserapilot.netlify.app/)**

The website package includes an animated product preview, responsive layouts, reduced-motion support, installation instructions, FAQs, social-sharing artwork, structured data, and a sitemap. It uses static HTML, CSS, and JavaScript with no build step.

If you redeploy the website, make sure its canonical URL, social-image URLs, and sitemap settings match the deployment domain. SEO features support discoverability; they do not guarantee indexing or rankings.

## ✅ Verification

Release checks included **30 automated tests** covering speed changes, website/course scope separation, navigation, external mode, and creator-profile behavior. A local browser media test verified acceleration, the 70% speed switch, resistance to simulated speed resets, and restoration on Stop.

These checks do not replace testing on your particular live course or video player.

## 🤝 Feedback

Found a problem? [Open an issue](https://github.com/vedhant-khajuria/courserapilot/issues) with your Chrome version, extension version, the affected website, and the message shown in the status panel. Avoid including passwords, login details, or private course information.

---

<div align="center">

**Built by [Vedhant Khajuria](https://github.com/vedhant-khajuria)**

[Website](https://courserapilot.netlify.app/) · [GitHub Repository](https://github.com/vedhant-khajuria/courserapilot) · [Creator Profile](https://github.com/vedhant-khajuria)

</div>
