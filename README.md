# COS 106 &mdash; Student Developer Portfolio

A responsive, accessible, multi-page portfolio and interactive web application built by **Peter Odejobi**, Data Science undergraduate at **Miva Open University**, Lagos.

This project was developed for the **COS 106** coursework to demonstrate semantic HTML5 structure, modern responsive CSS3 layout and animation techniques, and clean, modular JavaScript without external frameworks or heavy dependencies.

---

## 🌟 Key Features

### 1. Multi-Page Architecture
- **Home (`index.html`)**:
  - **Type-Specimen Preloader**: Editorial loading sequence measuring typography metrics (*cap height*, *x-height*, *baseline*, *descender*) before seamlessly splitting away.
  - **Curtain Hero**: Atmospheric entrance with smooth curtain-sway parallax and masked headline typography.
  - **Inline Word Previews**: Hoverable text triggers that reveal image previews positioned dynamically alongside the prose.
  - **Interactive Work Cards Animation**: Custom scroll-scrubbed Polaroid card choreography (peel-out from inline text, pile drop, 3D ring expansion, mouse-tilt parallax, dynamic depth-sorting, and a soft blur-dust fade exit into subsequent sections).
  - **Cinematic Video Introduction**: Widescreen video presentation featuring Peter's introduction, framed with responsive aspect-ratio containment and precise facial alignment.
  - **Process Roadmap & Curtain Call**: Interactive Act II process steps and theatrical curtain footer with an auto-updating live Lagos clock.
- **About (`about.html`)**:
  - Educational background table (Miva Open University, Data Science).
  - Career aspirations in data science, intelligent systems, and human-centered design.
  - Technical skills, personal interests, and an embedded HTML5 audio player featuring Peter's personal voiceover ("*Listen: why I code*").
- **Projects (`projects.html`)**:
  - Responsive project showcase grid featuring uniform card aspect ratios (`600:564`), hover zoom states, and direct links to live tools and source repositories.
- **Academic Planner (`planner.html`)**:
  - Interactive coursework task manager.
  - Full CRUD lifecycle: add new tasks, toggle completed states, and delete tasks with smooth animated leave transitions.
  - Persistent state management using browser `localStorage`.
  - Dynamic accessibility counters with `aria-live` announcements.
- **Contact Form (`contact.html`)**:
  - Accessible form with live JavaScript validation.
  - Validates full name, email format regex, phone numbers (digits-only enforcement), and message presence.
  - Animated error shake states, inline field error indicators, and polite confirmation feedback.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic markup (`<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<video>`, `<audio>`, form inputs) |
| **CSS3** | Custom variables, Flexbox, CSS Grid, 3D perspective transforms, `@keyframes`, backdrop filters, and film grain texture |
| **JavaScript (ES6+)** | Vanilla DOM manipulation, IntersectionObserver, requestAnimationFrame game loops, touch/mouse pointer tracking, and LocalStorage |
| **Media Formats** | MP4 (H.264 widescreen video), AAC/M4A & WAV (HTML5 cross-browser audio), SVG (scalable vector graphics) |

---

## 📂 Project Structure

```text
cos-106/
├── index.html              # Homepage with preloader, hero, cards ring & video
├── about.html              # Bio, education table, skills & audio voiceover
├── projects.html           # Project showcases in equalized grid
├── planner.html            # Coursework planner with persistent storage
├── contact.html            # Validated reach-out form
├── style.css               # Unified stylesheets and animations
├── script.js               # Planner logic and contact form validation
├── motion.js               # Preloader, cursor, word peek & cards choreography
├── images/                 # Optimized avatars, previews, and icons
│   ├── profile.jpg
│   ├── p2.png
│   ├── miva.jpeg
│   └── *.svg
├── media/                  # Audio and video assets
│   ├── intro.mp4           # Video introduction
│   ├── VO.m4a              # Voiceover recording (AAC)
│   └── story.wav           # Voiceover fallback (PCM WAV)
└── README.md               # Documentation
```

---

## 🚀 Getting Started

No build step, package manager, or server setup is required. The website runs entirely on vanilla client-side web technologies.

### Option 1: Direct File Opening
Double-click `index.html` or open it directly in any modern web browser (Google Chrome, Safari, Firefox, Edge).

### Option 2: Local HTTP Server (Recommended)
Running through a local web server ensures media streaming and storage features work without local file-origin restrictions:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node (npx)
npx serve .
```

Then visit `http://localhost:8000` in your browser.

---

## ♿ Accessibility & UX Considerations

- **Reduced Motion Support**: Fully respects system-level accessibility settings via `@media (prefers-reduced-motion: reduce)`. The preloader and scroll-scrubbed card animations safely skip to accessible static layouts for users sensitive to motion.
- **Responsive Layout**: Designed mobile-first, fluidly scaling from narrow mobile screens (320px) up to ultra-wide desktop monitors.
- **Screen Reader Friendly**: Proper ARIA roles, `aria-expanded`, `aria-hidden`, and `aria-live` polite regions on interactive widgets.
- **Keyboard Navigation**: Focus rings and accessible tab index ordering across burger menus, links, and forms.

---

## 👤 Author

**Peter Odejobi**  
- **Institution**: Miva Open University, Lagos  
- **Programme**: B.Sc. Data Science  
- **Student Email**: [p.odejobi1759@miva.edu.ng](mailto:p.odejobi1759@miva.edu.ng)  
- **GitHub**: [@Rinwaoluwa](https://github.com/Rinwaoluwa/)
