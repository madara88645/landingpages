# AGENTS.md

## Antigravity / Git Worktree Compatibility

Do **not** set `extensions.worktreeConfig=true` in this repository.

On Memo's Windows machine, Google Antigravity agent chat can silently fail when `.git/config` contains `extensions.worktreeConfig=true`, even if `core.repositoryformatversion=1`. The symptom is: user sends a prompt, no model response appears, and control immediately returns to the user.

Before opening this repo in Antigravity, check:

```bash
git config --get extensions.worktreeConfig
```

Expected result: no output. If it prints `true`, remove it:

```bash
git config --unset extensions.worktreeConfig
git status --short
git worktree list
```

Both verification commands must still work. Tools that create worktrees (Codex, Claude Code, OpenClaw, etc.) must not re-enable `extensions.worktreeConfig` unless Memo explicitly asks and Antigravity is retested afterwards.

## Cursor Cloud specific instructions

This repository is **static HTML/CSS/vanilla JS** only. There is no `package.json`, Docker stack, database, or CI-defined lint/test/build pipeline. Referenced products (Compiler, NeurIQ, etc.) are separate repos; this repo only hosts marketing/landing pages.

### Services

| Service | Required? | Notes |
|---------|-----------|--------|
| Static HTTP server | Yes (for local dev) | Serves all pages and relative assets; avoid relying on `file://` for cross-page navigation |
| FormSubmit.co | Optional | NeurIQ waitlist/contact forms in `neurIQ/index.html` need outbound network |
| Google Fonts CDN | Optional | Pages load fonts from `fonts.googleapis.com` |

### Run (development)

From repo root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` (portfolio), `http://localhost:8000/compiler/`, `http://localhost:8000/neurIQ/`, etc. Standalone mirrors under `repos/*` can be served the same way from their subdirectory on another port if needed.

Use a **tmux** session for long-running `http.server` processes so they survive backgrounding.

### Lint / test / build

No project scripts. Manual browser checks are the intended workflow. Optional smoke test:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/ http://127.0.0.1:8000/compiler/ http://127.0.0.1:8000/neurIQ/
```

Expect `200` for each path while the server is running.
