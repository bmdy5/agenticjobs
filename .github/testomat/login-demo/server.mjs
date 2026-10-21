import http from 'node:http';
import { readFile } from 'node:fs/promises';

const port = Number(process.env.PORT || 4187);
const index = new URL('./index.html', import.meta.url);

/** 运行仅供个人自动化测试使用的登录页面与演示接口。 */
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(await readFile(index));
  }
  if (req.method === 'GET' && req.url === '/dashboard') {
    if (!req.headers.cookie?.split('; ').includes('demo_session=ok')) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>测试工作台</title><main style="max-width:640px;margin:100px auto;font-family:system-ui"><p>个人测试环境</p><h1>登录成功</h1><p>欢迎，demo。浏览器已完成真实的输入、提交和页面跳转。</p><a href="/">返回登录页</a></main></html>');
  }
  if (req.method === 'POST' && req.url === '/api/login') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 1024) {
        res.writeHead(413);
        return res.end();
      }
    }
    let credentials;
    try {
      credentials = JSON.parse(body);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: '无效请求' }));
    }
    if (credentials.username === 'demo' && credentials.password === 'DemoPass123!') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': 'demo_session=ok; HttpOnly; SameSite=Strict; Path=/',
      });
      return res.end(JSON.stringify({ redirect: '/dashboard' }));
    }
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: '账号或密码错误' }));
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(port, '127.0.0.1', () => console.log(`Login trial: http://127.0.0.1:${port}`));
