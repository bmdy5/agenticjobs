import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { safeRedirect } from '../../dist/core/auth.js';

test('safeRedirect - valid same-origin path', () => {
  const result = safeRedirect('/dashboard');
  assert.strictEqual(result, '/dashboard');
});

test('safeRedirect - valid nested path', () => {
  const result = safeRedirect('/settings/profile');
  assert.strictEqual(result, '/settings/profile');
});

test('safeRedirect - empty string returns null', () => {
  const result = safeRedirect('');
  assert.strictEqual(result, null);
});

test('safeRedirect - null input returns null', () => {
  const result = safeRedirect(null);
  assert.strictEqual(result, null);
});

test('safeRedirect - external URL with http returns null', () => {
  const result = safeRedirect('http://malicious.com');
  assert.strictEqual(result, null);
});

test('safeRedirect - external URL with https returns null', () => {
  const result = safeRedirect('https://secure.com/path');
  assert.strictEqual(result, null);
});

test('safeRedirect - network-path reference starting with //', () => {
  const result = safeRedirect('//evil.com');
  assert.strictEqual(result, null);
});

test('safeRedirect - path with backslash', () => {
  const result = safeRedirect(String.raw`/path\to\resource`);
  assert.strictEqual(result, null);
});