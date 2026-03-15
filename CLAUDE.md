# CLAUDE.md

## Project: Tempo (Monastica)

Personal rhythm app — "not trying to make you more productive, trying to make you more alive."

### Stack
- Expo SDK 55, expo-router, TypeScript strict, zustand, react-native-reanimated
- Design: Utrecht minimalism — 8pt grid, Playfair Display / DM Sans / JetBrains Mono
- Colors: #FAFAF8 ground, #2D5A3D accent, #1A2B3C agent
- Animation: cubic-bezier(0.16,1,0.3,1) ONLY via TEMPO_EASING, no spring physics
- Domain symbols: ☽ ∿ ○ ✧ ■ • ♡ ∩

### Tabs
- **Reflect** — ocean hero, feeling check-in, domain vessels
- **Act** — field/tidepool/birch hero carousel, prioritized actions, escalations, proposals
- **Grow** — line chart hero, patterns, reflections, coach

### Visual Rules
- Contrast ratio must be high enough to actually see elements (opacity >= 0.45 for structural elements, >= 0.6 for text/icons)
- Hero visuals: 280px+ height, elements sized to be visible
- Icons/symbols: 18px+ font size, labels 12px+
- Each hero has 3 swipeable scenes in a carousel

### After Every Major Change

1. Run `/simplify` — reduce complexity, remove dead code, flatten unnecessary abstractions.
2. Commit and push to git.

```bash
git add -A
git commit -m "<concise description of what changed>"
git push origin main
```

Do not accumulate uncommitted changes across multiple features. Each major change should be its own commit.
