const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the site's real event target without a browser or external Fin calls.
function launcherContext({ locked = false } = {}) {
  const calls = [];
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        hidden: id === 'demo-page' ? locked : false,
        dataset: {},
        addEventListener() {},
      });
      return elements.get(id);
    },
    querySelectorAll() { return []; },
  };
  const context = vm.createContext({
    document,
    window: { Intercom(...args) { calls.push(args); } },
    sessionStorage: { getItem() { return null; } },
    setTimeout() { return 1; },
    clearTimeout() {},
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8'), context);
  return { context, calls };
}

test('Ask Nola opens the new-conversation composer instead of the Messages list', () => {
  const { context, calls } = launcherContext();
  vm.runInContext('openChat()', context);
  assert.deepEqual(calls, [['showNewMessage']]);
});

test('suggested questions are prefilled, without automatically sending a message', () => {
  const { context, calls } = launcherContext();
  vm.runInContext('openChat("What should I bring?")', context);
  assert.deepEqual(calls, [['showNewMessage', 'What should I bring?']]);
});

test('the demo gate prevents launcher calls before entry', () => {
  const { context, calls } = launcherContext({ locked: true });
  vm.runInContext('openChat()', context);
  assert.deepEqual(calls, []);
});
