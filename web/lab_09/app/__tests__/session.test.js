// __tests__/session.test.js
const request = require('supertest');
const app = require('../server');

describe('Session counters', () => {
  test('GET /api/session инкрементирует visits в рамках одной сессии', async () => {
    const agent = request.agent(app);

    const r1 = await agent.get('/api/session');
    expect(r1.statusCode).toBe(200);
    const v1 = r1.body.session.visits;

    const r2 = await agent.get('/api/session');
    expect(r2.statusCode).toBe(200);
    const v2 = r2.body.session.visits;

    expect(typeof v1).toBe('number');
    expect(v2).toBe(v1 + 1);

    // lastVisit должен обновляться
    expect(r2.body.session.lastVisit).toBeTruthy();
  });
});
