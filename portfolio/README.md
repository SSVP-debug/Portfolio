# Portfolio

Static site plain HTML/CSS/JS, no build step, no framework, no
dependencies to install. Opens directly in a browser.

## File structure

```
portfolio/
├── index.html
├── css/style.css
├── js/script.js
├── assets/
│   ├── photo.png              ← add your transparent-bg photo cutout here
│   ├── resume.pdf              ← add your resume PDF here
│   ├── README.txt
│   └── projects/
│       ├── code-club.mp4 (or .png)
│       ├── ai-agent.mp4 (or .png)
│       ├── burnout-prediction.mp4 (or .png)
│       └── README.txt
└── README.md
```

## Adding your photo and resume

Just drop two files into `/assets` with these exact names:

- `assets/photo.png` transparent-background PNG. Use remove.bg or
  Photoshop/GIMP to strip the background from a normal photo.
- `assets/resume.pdf` your resume, exported as PDF.

The site checks for both automatically. Missing either one falls back
gracefully instead of showing a broken image or dead link so you can
deploy before both files are ready and add them later without touching
any code.

There's also a **Preview mode** (gear icon, bottom-right of the live
site) that lets you try a photo/resume instantly in your browser tab
via drag-and-drop useful while you're deciding on a crop, before you
commit to the final files. It doesn't save anything; for the real
deployed site you still need the files in `/assets`.

## Adding project screenshots/videos

Same convention, in `assets/projects/`:

- `code-club.mp4` or `code-club.png`
- `ai-agent.mp4` or `ai-agent.png`
- `burnout-prediction.mp4` or `burnout-prediction.png`

Video takes priority if both exist for a project. No preview-mode
toggle for these (there are three of them, a file picker per project
would get cluttered) just drop them into the folder and refresh.

## Editing the stack section

The categories (Languages / Frameworks / Tools / Currently learning),
their comfort-level notes, and the badges in each are defined in one
place: the `STACK_GROUPS` object at the top of `js/script.js`. Edit
the text there nothing else needs to change, the page builds itself
from that config.

## Local preview

Just open `index.html` in a browser no server needed. If you want
a local server (some browsers restrict `fetch` on `file://` URLs,
which affects the resume-missing check), run one of:

```bash
# Python (already on your system)
python -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploying

### Option A GitHub Pages (free, simplest)

1. Push this folder to a GitHub repo (can be a new repo, or a
   `portfolio/` folder inside an existing one adjust the Pages
   source accordingly).
2. On GitHub: **Settings → Pages → Source** → select the branch
   (usually `main`) and the folder (`/root` if `index.html` is at the
   repo root).
3. Save. Your site is live at `https://<username>.github.io/<repo>/`
   within a minute or two.
4. Optional: add a `CNAME` file with a custom domain if you buy one.

### Option B Vercel (free, auto-deploys on push)

1. Push the folder to a GitHub repo.
2. Go to vercel.com → **New Project** → import that repo.
3. Framework preset: **Other** (it's static, no build command
   needed). Leave build/output settings blank.
4. Deploy. Every future push to `main` auto-redeploys.

Vercel is marginally better if you later want a contact-form backend
or serverless functions; GitHub Pages is simpler if you just want a
static link to put on your resume.

### Either way before you deploy

- Add `assets/photo.png` and `assets/resume.pdf` (and, optionally,
  the project screenshots/videos in `assets/projects/`)
- Double check `https://github.com/SSVP-debug` links point where you
  want (profile vs specific repo)
