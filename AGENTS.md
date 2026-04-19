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
