# TITAN Web UI specification

Status: **Draft v1**.

The product itself (domains, autonomy policy, users and roles) is specified once
in the backend repository:
[titan/docs/spec/product.md](https://github.com/vlukyanets/titan/blob/master/docs/spec/product.md).
This document covers only what is specific to the Web UI.

## Role of the Web UI

The Web UI is the client for a big screen. It does everything the Android app
does in chat and the domains, and it is where the owner manages the household:
members, devices, autonomy policy, usage and budgets. Wide screens get views
that do not fit a phone, such as a full week calendar, task tables and tracker
charts. It also works at phone widths, as a fallback on devices without the
app.

## Serving and signing in

- Every TITAN node serves the Web UI itself, next to its API, on its tailnet
  address, for example `https://titan-home.example-tailnet.ts.net/`. There is
  no separate web server and no public endpoint
  ([ADR 0002](../adr/0002-served-by-the-node.md)).
- **No pairing.** The user opens the node's address and signs in with their
  username and password. The node answers with a session cookie that
  JavaScript cannot read. The password is not stored.
- Each signed-in browser appears as a `web` device in the user's device list,
  named after the browser and system (for example "Firefox on Linux"), and can
  be revoked from any client. Signing out revokes it.
- A session ends after 30 days without use. The sign-in page then shows again,
  and the page the user was on opens after signing in.
- Each node address is its own site: a user who opens another node signs in
  there too. The UI does not switch nodes on its own.
- The rules for sessions, cookies and cross-site request protection are in the
  backend's
  [ADR 0012](https://github.com/vlukyanets/titan/blob/master/docs/adr/0012-browser-sessions-for-the-web-ui.md).

## Screens (v1)

| Screen | Contents |
|---|---|
| **Today** | Today's events and time blocks, due tasks, habit check-ins, pending approvals |
| **Chat** | Threads with the agent. Streamed replies, visible tool activity, inline Approve and Reject buttons for approval requests |
| **Tasks** | Projects and tasks: list and table views, filter, create, edit, complete, share |
| **Calendar** | Day, week and month views of events and time blocks, working hours |
| **Notes** | Notes list, search (semantic and keyword), editor, the "What TITAN remembers about me" memory list |
| **Trackers** | Trackers with quick logging, streaks and charts over chosen periods |
| **Reminders** | Upcoming and recurring reminders, Snooze and Done on fired ones |
| **Notifications** | History of reminders, approvals and system messages |
| **Activity** | The audit log of the agent's actions, with Undo where it is possible |
| **Settings** | Account, language, time zone, devices, per-domain autonomy overrides, usage and budget, sign out |
| **Household** (owner only) | Members, everyone's devices, default policies, usage and budgets for everyone |

Light and dark themes follow the system setting and can be switched by hand.

## Language and time

- Every text is translated. The UI starts in the browser's language when it is
  available and falls back to English; the user can change it in Settings.
  English, Russian and Ukrainian ship first, and adding a language needs only a
  new translation file.
- Dates, times and numbers use the formats of the chosen language.
- Times are shown in the user's TITAN time zone (the calendar preference). When
  the browser's time zone differs, Settings offers to switch.

## Offline behaviour

The v1 UI has **no offline storage or write queue**, like the Android app.
Losing the connection to the node must still not disrupt the user:

- **Content that is already on screen stays visible.** The page does not clear,
  blank out or switch to an error page.
- **No full-page spinner or blocking overlay** because of connectivity.
- A small **"Offline" indicator** appears in the header while the node is
  unreachable, and disappears when the connection returns.
- Actions that need the node (send a message, save, complete) are disabled or
  fail with a short inline message. Nothing is queued.
- When the connection returns, visible data refreshes quietly in the
  background.
- A chat reply that was cut off is fetched again from the thread history, where
  the node keeps writing it.

## Notifications

- While a tab is open, the UI checks for new notifications when the tab gains
  focus and about once a minute, and shows them in the header's notification
  list. Approvals can be answered from there.
- Browser push notifications (Web Push) are not part of v1: they would depend
  on the browser vendor's push service. Phones get push through the Android
  app.

## Platform

- Current and previous major versions of Firefox, Chrome and Safari, desktop
  and mobile.
- The API client is generated from the backend's OpenAPI schema
  ([ADR 0003](../adr/0003-openapi-generated-client.md)).
- Keyboard navigation and screen reader labels on every control
  (WCAG 2.2 AA as the target).

## Acceptance criteria (v1)

- Opening a node's address shows the sign-in page; signing in with a username
  and password opens Today, and the browser appears in the device list.
- Revoking that device from another client signs the browser out on its next
  request.
- Chat replies stream token by token, and approval requests can be answered
  inline.
- Stopping the node leaves the current page content in place, shows and hides
  the offline indicator, and never shows a full-page spinner.
- A member never sees the Household screen, and its API calls answer `403`.
- Every screen in the table above works at desktop and phone widths in the
  supported browsers, and passes an automated accessibility check.
