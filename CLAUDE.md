# CLAUDE.md

## After Every Major Change

1. Run `/simplify` — reduce complexity, remove dead code, flatten unnecessary abstractions.
2. Commit and push to git.

```bash
git add -A
git commit -m "<concise description of what changed>"
git push origin main
```

Do not accumulate uncommitted changes across multiple features. Each major change should be its own commit.
