# Last Testament — Owner app (Expo)

A clickable, animated build of the Owner app from `project/Owner App Prototype.dc.html`,
extended so **every tap leads somewhere**: 41 routes, no "coming soon" dead ends.

## Run it on your phone

```bash
cd app
npm install
npx expo start
```

Install **Expo Go** from the App Store / Play Store and scan the QR code. Everything
used here ships inside Expo Go, so you don't need a development build.

- The app opens on a **lock screen** and asks for Face ID (real Face ID / fingerprint
  if your phone has it set up, otherwise a simulated scan).
- **Long-press the Last Testament mark** on Home for the demo menu: Home states
  (protected / missed check-in / new account), the check-in notification, and the lock screen.
- Swipe from the left edge to go back, like any iPhone app.

`npx expo start --web` gives the browser version: phone frame plus a "Start from" sidebar.

## What's connected

| Area | Screens |
| --- | --- |
| Home | 3 states · notifications & activity (every notification opens its subject) · profile |
| Testament | categories · search (never searches secrets) · archived (restore) · recently updated |
| Record | detail with Reveal / Face ID / Copy (clipboard clears in 60 s) · history · secure document viewer · edit (Face ID if recipients change, "Discard changes?" guard) |
| Add record | 6 steps: type → template details → documents (upload progress, file-too-large state) → recipients → when → review & save |
| Review | one-by-one review of stale records, summary with "Update now" |
| People | live counts from data · person profile grouped by circumstance (expand "N more") · edit details · change role · replace · remove (Undo) · preview as recipient (Today / each scenario) · 4-step invite |
| Safety | release plan with live numbers · release history · check-in settings (frequency, channels, reminders) · check-in prompt |
| Settings | profile · notification preferences · privacy (real screenshot blocking on device) · accessibility (Larger text, Reduce motion — both work) · time zone · help FAQ · message support → request detail · legal · sign out → signed-out screen |
| Security | Face ID toggle · two-step method · recovery codes (Face ID to show, regenerate) · password with strength meter · recovery contact · trusted devices · active sessions · sign-in activity · emergency lock · pause account · delete account (type DELETE) |

Changes are live for the session: new records, archived/restored, edits, invited people,
role changes and confirmations all update counts, lists, history and the activity feed.

## Motion

- **Navigation** — native stack (`react-native-screens`): iOS push/pop with the previous
  screen visible underneath and full-screen swipe-back. Add record, Add person and the
  document viewer rise from the bottom; the check-in prompt and tabs cross-fade.
- **Screens** cascade in (10 px lift, 35 ms stagger); lists re-flow smoothly when items
  are added or removed (Reanimated layout animations).
- **Controls** — cards and buttons spring down when pressed; rows highlight like table
  cells; the tab-bar highlight, segmented controls, switches and checkmarks spring into place.
- **Wizards** slide steps left/right in the direction you're going; progress bars fill.
- **Face ID** — overlay with a pulsing glyph, then a green tick and a success haptic.
- **Sheets and toasts** spring up and slide away; destructive sheets give a warning haptic.
- **Reduce motion** (Settings → Accessibility) swaps slides and springs for fades.

On web, Reanimated's layout and cascade animations are turned off because the browser
stack re-shows screens in a way that leaves them stuck. Phones get the full motion.

## Structure

```
src/app/            Expo Router routes (one file per screen, thin wrappers)
src/screens/        Screen components: Home, Testament, Record, Flows (review + add record),
                    People, Safety, Settings, Security
src/components/     ui.tsx (cards, rows, buttons, inputs, toggles, segmented, progress…)
                    chrome.tsx (glass tab bar, Face ID, sheets, toasts, lock screen)
src/store.ts        Zustand session state + Face ID / haptics / toasts
src/actions.ts      Behaviours (check-ins, record CRUD, people, security, settings)
src/records.ts      Derived data: live records, review list, who-receives-what, plan numbers
src/data.ts         Demo persona, 33 records, people, conditions, add-record templates
src/nav.ts          Navigation helpers over expo-router
src/theme.ts        Colour and type tokens
```
