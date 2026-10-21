const assert = require('node:assert/strict');
const { test } = require('node:test');

// These failures validate Testomat reporting; they are not product defects.
for (let index = 1; index <= 5; index += 1) {
  test(`[TRIAL INJECTED] reporting failure ${index}`, () => {
    assert.equal('injected-for-testomat-trial', 'expected-success');
  });
}
