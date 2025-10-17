const request = require('supertest');
const app = require('../server');

describe('POST /login', () => {
  test('успешный логин -> 200, текст и 2 cookie (user, pwd)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ user: '12345', password: 'passw0rd' });

    expect(res.statusCode).toBe(200);
    expect(res.text.trim()).toBe('Login successfull...');

    const setCookie = res.headers['set-cookie'] || [];
    // Должны быть оба куки
    const hasUser = setCookie.some(c => /^user=12345;/.test(c));
    const hasPwd  = setCookie.some(c => /^pwd=passw0rd;/.test(c));
    expect(hasUser).toBe(true);
    expect(hasPwd).toBe(true);
  });

  test('неверный пароль -> 401 и "ERROR"', async () => {
    const res = await request(app)
      .post('/login')
      .send({ user: '12345', password: 'wrong' });

    expect(res.statusCode).toBe(401);
    expect(res.text.trim()).toBe('ERROR');
    // Куки ставиться не должны
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.length).toBe(0);
  });
});
