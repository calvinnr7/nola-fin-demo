import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleOrder, orderView } from '../order-model.mjs';

test('the five-item demo has two waiting and three in-progress products', () => {
  const view = orderView(sampleOrder());
  assert.deepEqual(view.counts, { all: 5, awaiting: 2, progress: 3 });
  assert.equal(view.products, 5);
  assert.equal(view.visible.length, 5);
  assert.equal(view.remaining, 0);
  assert.equal(new Set(view.visible.map((item) => item.id)).size, 5);
});

test('filtering shows only matching rows without changing order-wide totals', () => {
  const order = sampleOrder();
  for (const [filter, expected] of [['awaiting', 2], ['progress', 3]]) {
    const view = orderView(order, filter);
    assert.equal(view.visible.length, expected);
    assert.ok(view.visible.every((item) => item.status === filter));
    assert.equal(view.counts.all, 5);
    assert.equal(view.products, 5);
    assert.equal(view.remaining, 0);
  }
  assert.equal(order.items.length, 5);
});

test('larger orders support five at a time, the final partial page and show all', () => {
  const order = sampleOrder(12);
  const first = orderView(order);
  const more = orderView(order, 'all', 10);
  const all = orderView(order, 'all', 12);
  assert.equal(first.remaining, 7);
  assert.equal(more.visible.length, 10);
  assert.equal(more.remaining, 2);
  assert.equal(all.visible.length, 12);
  assert.equal(all.remaining, 0);
  assert.deepEqual(all.visible.slice(0, 5), first.visible);
  assert.equal(orderView(order, 'awaiting', 5).remaining, 0);
});

test('filters never invent items and invalid demo selections are refused', () => {
  assert.throws(() => sampleOrder(48), RangeError);
  assert.throws(() => orderView(sampleOrder(), 'completed'), RangeError);
});
