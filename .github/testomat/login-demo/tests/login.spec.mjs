import { test, expect } from '@playwright/test';

test('登录页面：空输入显示必填提示', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('请输入账号和密码');
});

test('登录页面：错误密码显示接口错误', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('账号', { exact: true }).fill('demo');
  await page.getByLabel('密码', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('账号或密码错误');
  await expect(page).toHaveURL('http://127.0.0.1:4187/');
});

test('登录页面：正确账号提交后进入工作台', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('账号', { exact: true }).fill('demo');
  await page.getByLabel('密码', { exact: true }).fill('DemoPass123!');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4187/dashboard');
  await expect(page.getByRole('heading', { name: '登录成功' })).toBeVisible();
});

test('登录页面：账号支持20字符并限制第21个字符', async ({ page }) => {
  await page.goto('/');
  const username = page.getByLabel('账号', { exact: true });
  await username.fill('abcdefghijklmnopqrst');
  await expect(username).toHaveValue('abcdefghijklmnopqrst');
  await username.fill('abcdefghijklmnopqrstu');
  await expect(username).toHaveValue('abcdefghijklmnopqrst');
});
