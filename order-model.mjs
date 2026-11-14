// Fictional demo orders. These records are never sent to Fin or Salesforce.
const names = [
  'RING FLOODLITE CAM WIRED PRO BK',
  'ENDEAVOUR PHOTO STRING LIGHTS',
  'PANA CR-2W/1B CAMERA BATTERY',
  'PANA 6LR61T/1B 9V BATTERY',
  'PANA CR-123A/1B CAMERA BATTERY',
  'USB-C CHARGING CABLE',
  'WIRELESS MOUSE',
  'BLUETOOTH SPEAKER',
  'LAPTOP SLEEVE',
  'HDMI CABLE',
  'WIRELESS KEYBOARD',
  'MEMORY CARD',
];

export const statuses = Object.freeze({
  awaiting: 'Awaiting Stock',
  progress: 'In Progress',
});

export function sampleOrder(size = 5) {
  if (![5, 12].includes(size)) throw new RangeError('Choose the 5- or 12-item demo order.');
  return {
    number: 'NL05183456',
    items: names.slice(0, size).map((name, index) => ({
      id: `demo-line-${index + 1}`,
      name,
      quantity: 1,
      status: index < 2 ? 'awaiting' : 'progress',
    })),
  };
}

export function orderView(order, filter = 'all', limit = 5) {
  if (!['all', ...Object.keys(statuses)].includes(filter)) throw new RangeError('Unknown order filter.');
  const counts = { all: order.items.length, awaiting: 0, progress: 0 };
  for (const item of order.items) counts[item.status] += 1;
  const matches = order.items.filter((item) => filter === 'all' || item.status === filter);
  const visible = matches.slice(0, Math.max(0, limit));
  return {
    counts,
    products: order.items.reduce((sum, item) => sum + item.quantity, 0),
    visible,
    remaining: matches.length - visible.length,
  };
}
