// __tests__/prefs.test.js
const request = require('supertest');
const app = require('../server');

describe('Prefs (cookies)', () => {
  test('POST /api/prefs без username -> 400', async () => {
    const res = await request(app).post('/api/prefs').send({ color: '#ff00ff' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/username/i);
  });

  test('POST /api/prefs с persistDays -> Set-Cookie c Max-Age', async () => {
    const res = await request(app)
      .post('/api/prefs')
      .set('X-Forwarded-Proto', 'https') // чтобы secure=true
      .send({ username: 'Rafael', color: '00ffaa', persistDays: 7 });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);

    const raw = res.headers['set-cookie'];
    const setCookie = Array.isArray(raw) ? raw : (raw ? [raw] : []);

    // username, page.color, lang
    expect(setCookie.length).toBeGreaterThanOrEqual(3);

    const hasUser = setCookie.some(c => /username=Rafael/.test(decodeURIComponent(c)) && /Max-Age=/.test(c));
    const hasColor = setCookie.some(c => /page\.color=%2300ffaa/.test(c) && /Max-Age=/.test(c));
    const hasLang = setCookie.some(c => /lang=/.test(c) && /Max-Age=/.test(c));
    expect(hasUser && hasColor && hasLang).toBe(true);
  });

  test('GET /api/prefs возвращает значения из кук', async () => {
    const agent = request.agent(app);

    // сначала установим куки
    const res1 = await agent
      .post('/api/prefs')
      .send({ username: 'UserX', color: '#123456' });
    expect(res1.statusCode).toBe(200);

    // теперь читаем их тем же агентом (cookie-jar)
    const res2 = await agent.get('/api/prefs');
    expect(res2.statusCode).toBe(200);
    expect(res2.body.prefs).toEqual(
      expect.objectContaining({ username: 'UserX', color: '#123456' })
    );
  });
});
