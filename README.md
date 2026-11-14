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
