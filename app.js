'use strict';

// A client-side demo gate only, as requested. This is not access control.
// The source, FAQ text and public Fin App ID are public on GitHub Pages.
const DEMO_PASSWORD_SHA256 = 'f45dc6995893a526e7b8607d138bbf6c7a9797dcc4cf7f0562e309820e8cc0b3';
const SESSION_KEY = 'nola-fin-demo-access-v1';
const gate = document.getElementById('password-gate');
const page = document.getElementById('demo-page');
const form = document.getElementById('access-form');
const passwordInput = document.getElementById('demo-password');
const accessError = document.getElementById('access-error');
const status = document.getElementById('chat-status');
const statusText = document.getElementById('chat-status-text');
const chatError = document.getElementById('chat-error');
const chatErrorText = document.getElementById('chat-error-text');
let messengerLoaded = false;
let messengerOpen = false;
let messengerLoadFailed = false;
let openTimeout;

function sessionIsUnlocked() {
  try { return sessionStorage.getItem(SESSION_KEY) === DEMO_PASSWORD_SHA256; }
  catch { return false; }
}

function setStatus(state, text) {
  status.dataset.state = state;
  statusText.textContent = text;
}

function showChatError(message) {
  clearTimeout(openTimeout);
  setStatus('error', 'Nola hasn’t opened yet.');
  chatErrorText.textContent = message;
  chatError.hidden = false;
}

function loadMessenger() {
  if (messengerLoaded) return;
  messengerLoaded = true;
  // Public visitor settings supplied by the workspace owner. No API token or JWT.
  window.intercomSettings = {
    api_base: 'https://api-iam.intercom.io',
    app_id: 'kc1tslma',
    hide_default_launcher: true,
    theme_mode: 'light',
  };
  // Fin's supplied website loader, deferred until the demo gate is passed.
  (function () {
    const w = window;
    const ic = w.Intercom;
    if (typeof ic === 'function') {
      ic('reattach_activator');
      ic('update', w.intercomSettings);
    } else {
      const d = document;
      const i = function () { i.c(arguments); };
      i.q = [];
      i.c = function (args) { i.q.push(args); };
      w.Intercom = i;
      const load = function () {
        const s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://widget.intercom.io/widget/kc1tslma';
        s.onerror = function () {
          messengerLoadFailed = true;
          showChatError('The chat could not load. Check your connection or browser content blocker, then reload this page.');
        };
        const x = d.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(s, x);
      };
      if (d.readyState === 'complete') load();
      else w.addEventListener('load', load, { once: true });
    }
  })();

  window.Intercom('onShow', function () {
    clearTimeout(openTimeout);
    messengerOpen = true;
    chatError.hidden = true;
    document.body.classList.add('chat-open');
    setStatus('ready', 'Nola is open.');
  });
  window.Intercom('onHide', function () {
    messengerOpen = false;
    document.body.classList.remove('chat-open');
    setStatus('ready', 'Your conversation is here when you need it.');
  });
}

function unlockDemo(moveFocus = true) {
  gate.hidden = true;
  page.hidden = false;
  passwordInput.value = '';
  accessError.textContent = '';
  loadMessenger();
  if (moveFocus) document.getElementById('hero-title').focus();
}

async function passwordHash(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    if (await passwordHash(passwordInput.value) !== DEMO_PASSWORD_SHA256) {
      accessError.textContent = 'That password isn’t quite right. Please try again.';
      passwordInput.setAttribute('aria-invalid', 'true');
      passwordInput.focus();
      return;
    }
    try { sessionStorage.setItem(SESSION_KEY, DEMO_PASSWORD_SHA256); } catch { /* Session persistence is optional. */ }
    passwordInput.removeAttribute('aria-invalid');
    unlockDemo();
  } catch {
    accessError.textContent = 'Please open this demo over HTTPS or localhost in a current browser.';
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById('toggle-password').addEventListener('click', (event) => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';
  event.currentTarget.textContent = show ? 'Hide' : 'Show';
  event.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  event.currentTarget.setAttribute('aria-pressed', String(show));
});

function openChat(question) {
  if (page.hidden) return;
  chatError.hidden = true;
  setStatus('opening', 'Opening Nola…');
  clearTimeout(openTimeout);
  if (question) window.Intercom('showNewMessage', question);
  else window.Intercom('showNewMessage');
  if (messengerOpen) setStatus('ready', 'Nola is open.');
  else openTimeout = setTimeout(() => {
    showChatError('The chat is taking longer than expected. Try again. If it still doesn’t open, check that Fin Messenger is enabled for this test website.');
  }, 15000);
}

document.querySelectorAll('[data-open-chat]').forEach((button) => button.addEventListener('click', () => openChat()));
document.querySelectorAll('[data-question]').forEach((button) => button.addEventListener('click', () => openChat(button.dataset.question)));
document.getElementById('retry-chat').addEventListener('click', () => {
  if (messengerLoadFailed) window.location.reload();
  else openChat();
});
document.getElementById('lock-demo').addEventListener('click', () => {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* No stored session. */ }
  if (typeof window.Intercom === 'function') window.Intercom('shutdown');
  window.location.reload();
});

if (sessionIsUnlocked()) unlockDemo(false);
