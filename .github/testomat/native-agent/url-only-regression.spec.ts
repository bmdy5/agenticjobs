import { test, expect } from '@playwright/test';

const baseURL = process.env.TRIAL_BASE_URL || 'http://127.0.0.1:4189';

test('登录页面：账号输入应保留 20 个字符并忽略第 21 个字符', async ({ page }) => {
  await page.goto(`${baseURL}/`);

  const username = page.getByLabel('账号', { exact: true });

  // 需求：账号最多 20 个字符，超出部分被忽略。
  await username.fill('');
  await username.pressSequentially('abcdefghijklmnopqrst');
  await expect(username).toHaveValue('abcdefghijklmnopqrst');

  await username.fill('');
  await username.pressSequentially('abcdefghijklmnopqrstu');
  await expect(username).toHaveValue('abcdefghijklmnopqrst');

  await username.fill('');
  await username.fill('abcdefghijklmnopqrstu');
  await expect(username).toHaveValue('abcdefghijklmnopqrst');
});
