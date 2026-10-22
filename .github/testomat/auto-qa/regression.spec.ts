import { test, expect } from '@playwright/test';

// 请求编号 2：账号输入框必须完整保留最多 20 个字符，超过 20 的字符才被忽略/截断。
const BASE_URL = String(process.env.TRIAL_BASE_URL);
const CHARS_20 = 'AbCdEfGhIj0123456789';
const CHARS_21 = 'AbCdEfGhIj0123456789Z';

test('请求编号2：账号输入框应完整保留 20 个字符且不提交登录', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.getByRole('heading', { name: '欢迎登录' })).toBeVisible();

  const username = page.locator('#username').first();
  await username.click();
  await username.press('ControlOrMeta+a');
  await username.press('Backspace');
  await username.pressSequentially(CHARS_20);

  // 真实业务断言：输入 20 个字符后，输入框实际值必须与输入完全一致。
  await expect(username).toHaveValue(CHARS_20);
  expect((await username.inputValue()).length).toBe(20);

  // 未提交登录：仍停留在登录页。
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  await expect(username).toBeVisible();
});

test('请求编号2：账号输入框超过 20 个字符时截断为 20 且不提交登录', async ({ page }) => {
  await page.goto(BASE_URL);

  const username = page.locator('#username').first();
  await username.click();
  await username.press('ControlOrMeta+a');
  await username.press('Backspace');
  await username.pressSequentially(CHARS_21);

  // 真实业务断言：第 21 个字符必须被忽略，结果为前 20 个字符。
  await expect(username).toHaveValue(CHARS_20);
  expect((await username.inputValue()).length).toBe(20);

  await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
});
