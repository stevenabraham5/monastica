# How I Built Tempo — Day 1

**Date:** March 15, 2026
**Builder:** Steven Abraham
**Repo:** github.com/stevenabraham5/monastica

---

## What is Tempo?

Tempo is a personal rhythm app — not a productivity tool, not a calendar, not a to-do list. It's built around one idea: **you already know how to live well, you just lose the thread.**

Tempo tracks the shape of your whole life across 8 domains — sleep, movement, nourishment, creative work, professional work, learning, personal relationships, and professional relationships. It doesn't count hours or set targets. It asks you how you feel *right now*, and over time it builds a picture of your tempo — where you're in flow and where you're drifting.

It has a private AI coach you can talk to — one that doesn't just listen, but cross-examines, challenges assumptions, and looks for opportunities you're not seeing.

## The Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React Native (Expo SDK 55) | Ship to iOS, Android, and web from one codebase |
| Routing | expo-router (file-based) | Clean URLs, deep linking for free |
| State | Zustand | Minimal boilerplate, no provider wrapping |
| Animation | react-native-reanimated | 60fps native driver, worklets |
| Typography | Playfair Display + DM Sans + JetBrains Mono | Dutch minimalism — editorial display, clean body, honest data |
| Design | Utrecht minimalism | Off-white ground (#FAFAF8), forest green accent (#2D5A3D), 8pt grid |

## What Got Built Today

### Architecture
- Full Expo project scaffold with TypeScript strict mode
- File-based routing: 4 tabs (Now, Reflect, Coach, Agent)
- Design system as code: colors (light/dark), typography scale, spacing grid, motion constants

### Design System
- **Colors**: Warm off-white ground, forest green accent, navy agent surface. Full dark mode.
- **Typography**: Playfair Display for display/headings (editorial feel), DM Sans for body/UI, JetBrains Mono for data. Strict type scale from display-xl (40px) to data (11px).
- **Spacing**: 8pt grid. Every measurement is a multiple of 8 (with 2, 4 for fine detail).
- **Motion**: Single cubic-bezier(0.16, 1, 0.3, 1) for all transitions. No spring physics. Staggered entrance animations.

### Screens

**Now** (Today tab)
- Time-of-day context label ("Morning", "Afternoon", "Night")
- Feeling check-in: tap a word (rested, scattered, focused, drained, restless, steady, flat, energised)
- Intention input: "What are you turning toward?"
- Tempo pulse: 8 domain vessels that fill from bottom to top based on your rhythm. Each domain has its own color tint and symbol.

**Reflect**
- Present-tense prompt: "What just happened?" — not "how was your week"
- Voice input support (Web Speech API on web, expo-speech-recognition on native)
- Past reflections stored locally

**Coach**
- Private conversational interface
- The coach listens, then challenges: "Is that what actually happened, or what you think should have happened?" / "What are you avoiding by focusing on this?"
- Simulated responses locally (designed for LLM API integration)
- Clear conversation for privacy

**Agent**
- Three persona modes: Guardian (blocks distractions), Pragmatist (efficiency), Delegator (deep work protection)
- Escalation handling
- Activity feed

### Components
- `TempoText` — enforces the type scale across all text
- `TempoInput` — input with voice button and submit
- `GoalCard` — vertical fill vessel with domain symbol, animated with reanimated
- `EnterView` — staggered fade-in entrance animation wrapper
- `AgentStrip` — bottom status bar for agent messages
- `BottomSheet` / `BrainstormSheet` — bottom drawer for brainstorming

### Data Layer
- `lifeModel` store: 8 life domains with sub-goals, reflections, check-ins, intention state
- `agentStore`: persona management, calendar integration state, escalation handling
- `coachStore`: private conversation history, simulated cross-examination responses
- `calendar` service: Apple Calendar + Outlook integration (code-ready, needs API keys)

### Voice Input
- Platform-aware: Web Speech API on browser, expo-speech-recognition on native
- Integrated into reflection and coach screens

### Dogfood Mode
- Built-in feedback system for beta testers
- Screen-context-aware: captures which screen the user is on
- Feature suggestions, bug reports, and response ratings
- All feedback sent to t3mpofeedback@outlook.com via mailto link (works without backend)
- Toggle on/off from Agent screen

## Design Decisions

**No hours, no calendars.** The user explicitly said "too calendar-like." Tempo doesn't show "48h / 56h this week." It shows a vessel that fills. You feel how full it is without numbers.

**Present tense only.** The app asks "How are you right now?" not "How was your day?" Reflection prompts are "What just happened?" not "What did you accomplish this week?"

**Dutch minimalism.** Inspired by Utrecht — quiet, lots of white space, typography does the heavy lifting. No icons in the tab bar, just words. No gradients, no shadows, no illustration.

**Private coach.** The coach doesn't comfort. It asks hard questions: "Is this urgent, or just loud?" / "What would change if you trusted yourself on this?" Designed for an LLM backend that has full context of your tempo data.

**Whole life, not work life.** 8 domains covering everything from sleep to creative expression to relationships. This is your 24-hour app.

## What's Next (Day 2+)

- [ ] Connect coach to actual LLM API (OpenAI / Anthropic)
- [ ] Persist data with AsyncStorage or SQLite
- [ ] Build EAS preview for TestFlight / Play Store internal testing
- [ ] Apple Calendar real integration (permissions + read events)
- [ ] Push notifications for nudges
- [ ] Onboarding flow — let users set their own domains and intentions
- [ ] Analytics: tempo health score derived from check-in patterns over time
- [ ] Export build log to blog post format

---

*Built in one day with Copilot. Shipped from an empty repo.*
