# Last Testament — Owner app (Expo)

React Native / Expo (SDK 57) build of `project/Owner App Prototype.dc.html`:
the clickable Owner app demo with the 14 screens, demo content, Face ID gating,
confirmation sheets, toasts and push / pop / fade transitions.

## Run

```bash
cd app
npm install
npx expo start          # scan the QR code with Expo Go (iOS / Android)
npx expo start --web    # browser: phone frame + "Start from" sidebar, like the prototype
```

On device there's no sidebar. **Long-press the Last Testament mark on Home** to
open the demo menu (Home · protected / missed check-in / new account, Check-in
notification, plus the suggested flows).

## Face ID

Actions that reveal secrets, pause or confirm check-ins, lock the account or
confirm a destructive sheet call `withFace()` in `src/store.ts`. On a device
with biometrics enrolled it uses the real Face ID / fingerprint prompt via
`expo-local-authentication`. If none is enrolled, and on web, it shows the
prototype's simulated Face ID overlay for 1.1 s.

## Structure

| Path | What |
| --- | --- |
| `src/theme.ts` | Colour / type tokens from Foundations (deep green, stone, ivory, bronze, semantic colours) |
| `src/data.ts` | Demo persona and all 33 records, ported verbatim from the prototype |
| `src/store.ts` | Zustand store: navigation stack, review flow, reveals, dialogs, toasts, Face ID |
| `src/actions.ts` | Prototype behaviours (I'm okay, pause, archive / delete, lock, delete account …) |
| `src/records.ts` | Derived record status: last confirmed, review prompt, masking |
| `src/components/ui.tsx` | Cards, rows, buttons, badges, avatars, nav bar |
| `src/components/chrome.tsx` | Glass tab bar, Face ID overlay, dialog sheet, toast |
| `src/screens/*` | Home (3 states), Testament / Category / Record / Review / Add record, People / Ama / Release plan, Check-in / Settings / Security |
| `src/PhoneApp.tsx` | Single-stack navigator with the prototype's 340 ms transitions |
| `src/WebDemo.tsx` | Web-only presentation: iPhone frame + sidebar |

Navigation is a small custom stack rather than Expo Router, to keep the
prototype's exact behaviour: tab switches cross-fade and clear the stack,
pushed screens hide the floating tab bar, and the side panel or demo menu can
jump to any state. Moving to Expo Router is straightforward once the real
screen inventory (onboarding, recipient portal) settles.

`assets/brand/` holds the logo and mark with their off-white backgrounds made
transparent. The prototype got the same effect with `mix-blend-mode: multiply`.
