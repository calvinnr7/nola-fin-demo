import { sampleOrder, orderView, statuses } from './order-model.mjs';

const byId = (id) => document.getElementById(id);
const accessHash = 'f45dc6995893a526e7b8607d138bbf6c7a9797dcc4cf7f0562e309820e8cc0b3';
const accessKey = 'nola-fin-demo-access-v1';
let order = sampleOrder();
let filter = 'all';
let limit = 5;

function showPreview(moveFocus = false) {
  byId('preview-gate').hidden = true;
  byId('order-preview').hidden = false;
  if (moveFocus) {
    byId('preview-title').tabIndex = -1;
    byId('preview-title').focus();
  }
}

try { if (sessionStorage.getItem(accessKey) === accessHash) showPreview(); } catch { /* Tab storage is optional. */ }

byId('preview-access').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = byId('preview-password');
  const submit = event.currentTarget.querySelector('button');
  submit.disabled = true;
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== accessHash) {
      byId('preview-access-error').textContent = 'That password isn’t quite right. Please try again.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    try { sessionStorage.setItem(accessKey, accessHash); } catch { /* Tab storage is optional. */ }
    input.value = '';
    input.removeAttribute('aria-invalid');
    byId('preview-access-error').textContent = '';
    showPreview(true);
  } catch {
    byId('preview-access-error').textContent = 'Open this demo over HTTPS or localhost in a current browser.';
  } finally {
    submit.disabled = false;
  }
});

function itemRow(item) {
  const row = document.createElement('li');
  row.className = 'order-item';
  const initial = document.createElement('span');
  initial.className = `item-initial ${item.status}`;
  initial.setAttribute('aria-hidden', 'true');
  initial.textContent = item.name.charAt(0);
  const copy = document.createElement('div');
  copy.className = 'item-copy';
  const name = document.createElement('h3');
  name.className = 'item-name';
  name.textContent = item.name;
  const fulfilment = document.createElement('p');
  fulfilment.className = 'item-fulfilment';
  // Fixed icon markup only; item values are assigned through textContent.
  fulfilment.innerHTML = '<svg aria-hidden="true"><use href="#store"/></svg><span>Click &amp; Collect - no tracking</span>';
  copy.append(name, fulfilment);
  const badge = document.createElement('span');
  badge.className = `status-badge item-status ${item.status}`;
  badge.textContent = statuses[item.status];
  row.append(initial, copy, badge);
  return row;
}

function render() {
  const view = orderView(order, filter, limit);
  byId('order-title').textContent = `Order ${order.number}`;
  byId('order-quantity').textContent = `${view.counts.all} items · ${view.products} products`;
  byId('completed-count').textContent = `0 of ${view.products} products completed`;
  byId('status-distribution').setAttribute('aria-label', `${view.counts.progress} products in progress, ${view.counts.awaiting} awaiting stock, 0 completed`);
  byId('progress-segment').style.width = `${view.counts.progress / view.counts.all * 100}%`;
  byId('awaiting-segment').style.width = `${view.counts.awaiting / view.counts.all * 100}%`;
  document.querySelectorAll('[data-filter]').forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    byId(`count-${button.dataset.filter}`).textContent = String(view.counts[button.dataset.filter]);
  });
  byId('order-items').replaceChildren(...view.visible.map(itemRow));
  byId('order-pagination').hidden = view.remaining === 0;
  byId('more-label').textContent = `Show ${Math.min(5, view.remaining)} more`;
  const matching = view.visible.length + view.remaining;
  const description = filter === 'all' ? 'items' : `${statuses[filter].toLowerCase()} items`;
  byId('filter-result').textContent = view.remaining
    ? `Showing ${view.visible.length} of ${matching} ${description}`
    : `Showing all ${matching} ${description}`;
}

document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  limit = 5;
  render();
}));

document.querySelectorAll('[name="sample-size"]').forEach((input) => input.addEventListener('change', () => {
  if (!input.checked) return;
  order = sampleOrder(Number(input.value));
  filter = 'all';
  limit = 5;
  render();
}));

function expand(all) {
  const previouslyVisible = orderView(order, filter, limit).visible.length;
  limit = all ? order.items.length : limit + 5;
  render();
  // Keep keyboard focus in the card when the last expansion hides its button.
  if (byId('order-pagination').hidden) {
    const firstNewRow = byId('order-items').children[previouslyVisible];
    if (firstNewRow) {
      firstNewRow.tabIndex = -1;
      firstNewRow.focus({ preventScroll: true });
    }
  }
}

byId('show-more').addEventListener('click', () => expand(false));
byId('show-all').addEventListener('click', () => expand(true));
render();
