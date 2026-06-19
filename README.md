# Hardy Amuntai — Portfolio Site

🔗 **Live site:** [haitdyckler.github.io](https://haitdyckler.github.io)

A personal portfolio built as a pixel-art, game-inspired website instead of a typical scrolling page. Visitors land on a retro "desktop," can walk a sprite through a 2D arcade hub to reach different sections, build and share their own pixel character, play a mini runner game, and even drop into a terminal with a custom command set — all built with vanilla HTML, CSS, and JavaScript.

## Features

- **Desktop-style home (`index.html`)** — A retro OS-style interface with draggable/closable windows (Introduction, About, Contact, Resume, Skills) and desktop icons, including a typing-effect intro.
- **Arcade hub (`startscreen.html`)** — A top-down, walkable pixel world (canvas + sprite animation) where you move with WASD/arrow keys and walk through labeled doors to reach Projects, About, Contact, Resume, and the mini-game.
- **Character creator (`createsprite.html`) & gallery (`gallery.html`)** — Design a custom pixel sprite and share it to a public gallery, backed by Firebase Realtime Database.
- **Character select (`character-select.html`)** — Pick which sprite (including your own created ones) to play as in the arcade hub.
- **Pixel Runner (`game.html`)** — A simple side-scrolling obstacle-dodging mini-game.
- **Terminal Hub (`terminal.html`)** — A simulated command-line interface with custom commands (`help`, `whoami`, `date`, `typetest`, and more), including **corridor**, an encrypted peer-to-peer chat session built with the Web Crypto API and Firebase Realtime Database.
- **Drum Kit (`drums.html`)** — An interactive, spatially-laid-out drum kit using the Web Audio API with real sampled drum sounds and keyboard shortcuts.
- **Projects (`projects.html`)** — Write-ups of featured work: *Pom-Pom Adventure* (Java/OOP class project), *Eternal Fantasy* (a turn-based JRPG senior project with an adaptive AI opponent), and an *Arduino Alarm Clock*.
- **About / Contact / Resume** — Standard portfolio pages with embedded résumé PDF and contact details.

## Tech Stack

- **HTML / CSS / JavaScript** (no frameworks or build step)
- **Canvas API** for the arcade hub and sprite/game rendering
- **Web Audio API** for the drum kit
- **Web Crypto API** for end-to-end encrypted terminal chat
- **Firebase Realtime Database** for sprite sharing/gallery and the corridor chat backend
- **GitHub Pages** for hosting

## Project Structure

```
.
├── index.html              # Desktop-style home page
├── startscreen.html         # Walkable arcade hub (entry point to other pages)
├── character-select.html    # Choose your sprite/character
├── createsprite.html        # Pixel sprite creator
├── gallery.html              # Public sprite gallery
├── game.html                  # Pixel Runner mini-game
├── terminal.html              # Terminal hub (incl. "corridor" encrypted chat)
├── drums.html                  # Interactive drum kit
├── projects.html                # Featured project write-ups
├── about.html                     # About page
├── contact.html                    # Contact page
├── resume.html                      # Resume page
├── assets/                           # Images, sprites, resume PDFs
├── css/                               # Stylesheets (per-page + shared)
└── js/                                 # Scripts (per-page logic + terminal.js)
```

## Running Locally

No build tools required — it's static HTML/CSS/JS.

```bash
git clone https://github.com/Haitdyckler/Haitdyckler.github.io.git
cd Haitdyckler.github.io
```

Then either open `index.html` (or `startscreen.html`) directly in a browser, or serve the folder locally to avoid any path/CORS quirks:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

> **Note:** The sprite gallery, sprite sharing, and corridor chat features connect to a live Firebase Realtime Database configured in `createsprite.html`, `gallery.html`, and `js/terminal.js`. To run those features against your own backend, swap in your own Firebase project config.

## License

No license specified — all rights reserved by the author unless stated otherwise.
