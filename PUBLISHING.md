# How to Publish Tempo for Beta Testing

## Option 1: Expo Preview (Fastest — minutes)

**What:** Share a link. Anyone with Expo Go can open it on their phone.

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create a preview build URL
eas update --branch preview --message "Day 1 build"
```

Then share the QR code or link. Testers install Expo Go (free) and scan it.

**Pros:** Zero cost, instant updates, works on iOS and Android.
**Cons:** Requires Expo Go app, not a "real" app install.

---

## Option 2: EAS Build — TestFlight (iOS) + Internal Testing (Android)

**What:** Build actual native app binaries. Distribute via Apple TestFlight and Google Play internal testing.

```bash
# Configure EAS Build
eas build:configure

# Build for iOS (requires Apple Developer account — $99/yr)
eas build --platform ios --profile preview

# Build for Android (free Google Play Console account)
eas build --platform android --profile preview

# Submit to TestFlight
eas submit --platform ios

# Submit to Google Play internal track
eas submit --platform android
```

**Pros:** Real app install, feels native, up to 10,000 TestFlight testers.
**Cons:** Apple Developer account costs $99/yr. iOS builds take ~15 min. Needs app review for TestFlight external testing (internal = instant, up to 100 testers).

**Timeline:**
- Apple Developer account signup: same day
- First TestFlight build: within 1 hour of account approval
- Google Play internal testing: within 1 hour

---

## Option 3: Web Deploy (Broadest reach, zero friction)

**What:** Deploy the web version to Vercel, Netlify, or Expo's web hosting. Share a URL. Works in any browser.

```bash
# Export for web
npx expo export --platform web

# Deploy to Vercel (free tier)
npm i -g vercel
cd dist
vercel --prod

# Or deploy to Netlify
npx netlify deploy --prod --dir dist
```

**Pros:** Zero install for testers — just open a link. Free hosting. Instant updates.
**Cons:** Web experience lacks native feel (no haptics, limited voice). Some components may need web-specific tweaks.

**Recommended for initial feedback round.** Lowest friction. You can always add native builds later.

---

## Option 4: Expo Snack (Quick demo)

**What:** Upload code to snack.expo.dev. Runs in browser with live preview.

**Pros:** No deployment needed. Shareable link.
**Cons:** Limited to smaller projects, may need trimming.

---

## Recommended Launch Sequence

1. **Today:** Deploy web version to Vercel. Share URL on LinkedIn/Threads. Enable dogfood mode by default.
2. **This week:** Set up Apple Developer account. Get TestFlight build out to 10-20 close testers.
3. **Next week:** Google Play internal testing track for Android testers.
4. **Ongoing:** `eas update` for instant OTA updates to all platforms.

---

## Quick Start: Web Deploy to Vercel

```bash
# From project root
npx expo export --platform web
npm i -g vercel
cd dist
vercel

# Follow prompts. You'll get a URL like tempo-xyz.vercel.app
# Share that URL everywhere.
```

That's it. People click it, the app loads, dogfood mode lets them send you feedback.
