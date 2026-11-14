# Nola · Fin FAQ demo

A responsive, Nola-inspired red-and-cream test website using the official Fin / Intercom visitor JavaScript snippet. Connected to Fin workspace **kc1tslma** (US region).

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. No npm install or build step is needed for this plain-JavaScript version.

## GitHub Pages

Publish the root of the `main` branch under Settings → Pages. All links and assets are relative, so a project subpath works. `.nojekyll` keeps publishing static.

## Demo password screen

The owner explicitly selected a lightweight, bypassable demo password screen. **This is not authentication or a security boundary.** The HTML, FAQs, JavaScript and public Fin App ID are visible in this public repository. Never add private information, Salesforce credentials, an Intercom API token, or a JWT signing key.

Only the password's SHA-256 digest is stored in `app.js`. A successful entry unlocks the page for the current browser tab. Fin is loaded after the gate is passed. “Lock demo” clears the tab's access and shuts down the local Messenger session. The password is shared separately with the owner.

To change the demo password, compute a SHA-256 digest locally and replace `DEMO_PASSWORD_SHA256` in `app.js`. Use `getpass.getpass()` to enter it without putting it in shell history. Change `SESSION_KEY` to invalidate old demo-tab sessions.

## What the demo does

- Opens the **real Fin Messenger** using the provided visitor snippet.
- Uses a custom red “Ask Nola” launcher and a light Messenger theme.
- Offers four questions that open the Messenger with a prefilled composer. The visitor still sends the question.
- Shows a loading/error message if Messenger does not open. It does not fabricate chat replies.
- Explains Click & Collect using the approved prototype content, sourced from https://www.noelleeming.co.nz/click-collect.
- Uses no Salesforce connection or backend. It cannot look up orders or transfer to a human.

## Fin workspace setup

The site cannot enable or publish Fin's channel on its own. In workspace `kc1tslma`:

1. Keep the FAQ article enabled for Fin and the Nola Guidance enabled on Fin Main.
2. Complete the Fin Messenger deployment checklist and the visitor workflow.
3. If prompted, enable the required Messenger connection/API setting on the install screen.
4. Allow the GitHub Pages site's URL in any trusted-domain / display-condition rules. Do not disable existing verification requirements to work around a deployment issue.
5. Use the workspace's **Test before going live** screen and its own generated test URL when needed. Do not reuse an environment ID from documentation or another workspace.

The surrounding page and custom launcher use an illustrative Nola-inspired red palette, not a verified brand stylesheet. The native Messenger header, message colours, display name and avatar are controlled separately in Fin under Settings → Fin Messenger → Web → Appearance and Fin's identity. The site cannot restyle the cross-origin Messenger iframe.

## Checks

Verify the password gate, incorrect-password message, session unlock/lock, question composer and responsive layout. A successful loader request does not prove Fin answered: send a real test question and inspect the conversation in Fin.

## Order card preview

Open `order-card.html` (also linked from the FAQ page). It uses the same demo password and tab session. This is a standalone UI preview using fictional records; it does not load the Fin SDK, send records to Fin, look up real orders or claim to be a Fin response.

The default order contains five line items recreated from the supplied Nola screenshots: two Awaiting Stock and three In Progress. Count pills filter the rows while keeping the whole-order totals and status distribution unchanged. The optional 12-item sample demonstrates Show 5 more and Show all. With five items there is no unnecessary expansion control. The coloured bar represents the status distribution, not percentage completion; no sample products have completed.

Run the dependency-free logic and launcher checks:

```sh
node --test tests/launcher.test.cjs tests/order-model.test.mjs
```

### Fin Messenger integration status

This card has **not** been installed inside Fin Messenger. The Fin Agent Build plugin cannot read Developer Hub/installed apps/entitlements or install a Canvas Kit app. Its read-only inspection of workspace `kc1tslma` found no existing app step and could not confirm custom-app support for this Fin for Platforms demo. The user checked the Add step menu and reported Message, Collect data, Collect reply and Ask for CSAT, with no Send an app option exposed there. This does not establish a supported custom-card insertion route.

General Intercom documentation supports [Canvas Kit Messenger apps](https://developers.intercom.com/docs/canvas-kit) in conversations and workflows. Native Canvas Kit cards use predefined components, so this exact HTML/CSS design cannot simply be pasted into a native card. A [Messenger Sheet](https://developers.intercom.com/docs/build-an-integration/getting-started/build-an-app-for-your-messenger/sheets-app) allows a custom iframe screen; that is the candidate route for this design if this workspace supports apps. A Sheet opens a separate screen within Messenger, rather than rendering this exact custom HTML inline in a chat bubble.

Before integrating:

1. Confirm Developer Hub can create/install a Messenger app and that the Fin workflow offers Send an app. General Intercom documentation alone does not establish this workspace's entitlement.
2. Provide an HTTPS backend for Canvas Kit callbacks (Initialize, Submit, Sheet and Submit Sheet as used). GitHub Pages cannot accept those POST callbacks. Verify callback signatures with the app's client secret stored server-side; do not commit it or put it in the static site. The public Fin workspace ID is not that secret.
3. Serve the reusable order-card UI from the Sheet backend with its own appropriate request verification. Remove preview-only navigation and sample-picker chrome for the embedded screen. Keep the fictional-data label until a real authenticated data connector is implemented.
4. Test app delivery and Sheet interactions in the actual Fin workspace before publishing any workflow change. No workflow was modified as part of building this visual preview.
