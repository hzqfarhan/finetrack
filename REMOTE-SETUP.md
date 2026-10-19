# ETC phone remote: Vercel + Supabase

The presentation and phone remote are static pages on Vercel. Commands use ordinary HTTPS requests to Supabase every 500 ms while paired. There is no WebSocket, Realtime subscription, separate relay server or service-role key.

## 1. Supabase

Run `supabase/ETC_remote.sql` in your project's SQL Editor. It creates:

- `ETC_sessions`: private pairing credentials, screen state and presence.
- `ETC_commands`: short-lived commands and delivery acknowledgements.
- `ETC_remote`: the only browser-facing database function.

Names are case-sensitive and quoted in SQL. Both tables have RLS enabled and no direct permissions for browser roles. Every operation except creation requires a random private host or controller token. Only the host token can update the screen state or end the session. Keep pairing links private. No Supabase Auth user or Realtime configuration is required.

The publishable key identifies the app; it is not the pairing credential. Pairing credentials stay in the private QR/link fragment and are sent to Supabase in request bodies. Sessions expire after eight hours. Ending a session deletes its commands immediately. Expired sessions are removed when a new session is created. A maximum of 100 unexpired sessions is permitted; this is a small classroom tool, not a public multi-tenant service.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local use, or add these variables in Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_ETC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_ETC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_ETC_REMOTE_URL=https://etcremote.seladevs.my/
```

Use the publishable key from Supabase, never a service-role or secret key. For a local test, leave `NEXT_PUBLIC_ETC_REMOTE_URL` blank so the QR points to the local `/remote/` page. Restart local development after editing variables. On Vercel, redeploy after changing them because these public settings are embedded during the build.

## 3. Vercel and domains

Import this repository into Vercel using the Next.js preset. `vercel.json` configures `npm run build` and `.next` as the framework build directory. Vercel needs the manifests in `.next` to process this Next.js project, even though `output: 'export'` also generates an `out` folder for ordinary static hosting. Do not set Vercel's Output Directory to `out` with the Next.js preset: that causes `NEXT_NO_ROUTES_MANIFEST`. Add your presentation domain and `etcremote.seladevs.my` to the same project. Add the DNS record Vercel shows for each domain at your DNS provider. No DNS changes have been made by this implementation.

The root page detects the remote hostname and shows the remote there. The presentation continues to appear on its own hostname. `/remote/` is also available on the presentation domain for testing. Both hosts must use the same Supabase project. No additional Vercel server function or persistent server is needed.

## 4. Present

1. Open the presentation on the computer connected to the projector.
2. Before sharing that screen with the audience, click **Remote**.
3. Scan the private QR with your phone, or copy/open its pairing link.
4. Wait for **Connected**, then close the pairing panel on the computer.
5. Tap **Next** or swipe left on the navigation area. Swipe right for Previous. Next walks through the demo moments before continuing to the next slide; Previous reverses demo moments.
6. Use Confetti, Close/Open curtain, Spotlight or Blank/Show screen. **Clear all effects** restores the normal stage. The computer also has **Clear effects · Esc** as an escape hatch.
7. End the session from the computer's Remote panel when finished.

The phone shows the current slide, demo moment and existing speaker cues. Controls pause when the host is offline. Keep the presentation tab open and visible: browsers may throttle background tabs. Internet access is required on both devices, but they do not need the same Wi-Fi when deployed.

A paired host and one phone make about four database requests per second while connected. End the remote session when finished to stop polling.

Polling adds roughly 0–500 ms plus network time before a command reaches the screen; confirmation may take another polling cycle. Commands older than four seconds are never replayed after reconnecting. A lost response displays a warning rather than automatically resending a navigation action. Refreshing the presentation starts a new pairing session.

For phones testing a local computer, use `npm run dev:lan` and the computer's Wi-Fi IP, not localhost. Phone use of the locally hosted app may require HTTPS for some browser APIs; the deployed Vercel version provides HTTPS. No firewall rules are changed automatically.

## Validation

`npm run test:remote` runs the actual SQL on a local PostgreSQL-compatible PGlite database, checking pairing permissions, RLS permissions, duplicate commands, acknowledgement, stale commands, offline handling and session isolation. `npm run build` checks both static routes. Live Supabase and DNS validation requires your project settings and deployment.


## Preview, timer and feature controls

The phone shows a lightweight current-slide preview and an expandable Up next preview. During the finding demonstration, Up next shows the next story moment; after the last moment, it shows the next slide. The preview mirrors headings, description, demo dialogue, selected feature and persistent stage effects. It uses a static product reference rather than streaming the projector: 3D camera positions, colour rendering, motion and uploaded sound are not mirrored.

The private timer defaults to 9:30, with 8:00, 9:00 and 10:00 targets. Start, pause, resume and reset only affect this phone. Time uses timestamps, so it catches up after a phone background pause, and is saved in this tab's session storage for refresh recovery. It is never sent to Supabase or shown on the main screen. It turns amber in the last minute and red after the target.

Feature buttons jump to Explore the parts and focus the charging port, indicator, attachment opening or casing. Clear all effects also clears the selected feature. The audience-question button toggles a full-screen “What would you attach yours to?” prompt. Clear effects or Escape on the presentation dismisses it.

If you already installed the earlier SQL, run `supabase/ETC_remote.sql` again to update the command allowlist. It preserves existing tables and supports the new question/highlight commands. Redeploy the presentation and remote together so they understand the same command set.


## Password remote and video effects
Set `ETC_REMOTE_MASTER_PASSWORD` in Vercel to your chosen password (the requested value is saved in the ignored local `.env.local`). Set `ETC_SUPABASE_SERVICE_ROLE_KEY` to the Supabase service-role key in the server environment only. Never prefix these settings with `NEXT_PUBLIC_`. Keep the existing public Supabase URL and publishable key settings. Redeploy after setting environment variables.

This app now uses a Next.js server route for password verification; deploy with Vercel's Next.js preset and `.next` output, not static export. Open the presentation and select **Remote**, then open https://etcremote.seladevs.my and enter the password. Only one presentation remote session should be active. QR links remain optional.

Rerun `supabase/ETC_remote.sql` to enable video and master audio commands. The seven clips in `public/greenscreen` are available as remote buttons; green is removed during playback. **Stop video**, **Clear all effects**, or Escape stops playback. The master sound button on the presentation and remote controls video and demo sound (the demo's own mute also applies). Sound starts muted. Browser autoplay rules may require allowing sound on the presentation computer. MOV browser compatibility and the green threshold should be checked with your actual clips before presenting.


## Hidden remote controls and effects downloads
The main presentation now starts its remote session automatically. There is no Remote or Clear effects button on the audience screen; use the password page on your phone. Keep only the intended main-screen presentation tab open when connecting. The header's **Download effects** button downloads all seven original MOV clips in one ZIP.

Effects render in a separate layer attached to the page body, above the slide, curtain, and blank-screen layers. Video and confetti never intercept clicks. Repeated confetti taps add overlapping bursts; the button stays enabled while other commands await acknowledgement. Rerun `supabase/ETC_remote.sql` for the updated queue behavior (up to 30 commands per second). Escape and the phone's Clear all effects still clear the stage.


## Globe trackpad
Rerun `supabase/ETC_remote.sql` to enable the remote's Globe trackpad. Drag horizontally to orbit the product and vertically to tilt (limited to 80 degrees). Reset angle returns the camera to a straight-on view. Rotation stops auto-spin. The trackpad supports touch, mouse and arrow keys, and is disabled on non-model slides and the fixed port close-up. Position updates keep only the latest angle, separate from the slide command queue; the host polls every 150 ms, so response depends on network speed. The phone globe is a control indicator, not a live 3D preview.


## Live audience following
Rerun `supabase/ETC_remote.sql` and redeploy. Open the main presentation first, then sign into the password remote: this selects the earliest-opened online presentation and starts the shared broadcast. Subsequent remote sign-ins reuse that active broadcast. Share the ordinary presentation URL with viewers. Viewers follow slide, demo and effect updates automatically; **Leave live session** switches to independent browsing, and **Join live session** catches up. Manually changing slides also leaves following. The choice is saved for the current browser tab. If the main screen closes, following waits; open a presentation and sign into the remote again to select a new source.

Audience reads expose presentation state only, never controller keys or speaker notes. The main presentation still must stay open to execute remote commands. Audio remains subject to each viewer browser's autoplay permissions; uploaded local demo audio is not distributed. Video playback is approximate rather than frame-synchronized.
