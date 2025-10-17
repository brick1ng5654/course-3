// __tests__/movies.test.js
const fs = require('fs');
const path = require('path');

describe('Movies API', () => {
  const realRead = fs.readFileSync;
  const realWrite = fs.writeFileSync;

  // Фикстуры фильмов
  const dataRU = [
    { id: 1, title: 'Фильм', year: 2001, genres: ['Драма'] },
    { id: 3, title: 'Кино',  year: 2005, genres: ['Комедия'] }
  ];
  const dataEN = [
    { id: 2, title: 'Movie',  year: 2002, genres: ['Drama'] },
    { id: 5, title: 'Cinema', year: 2008, genres: ['Comedy'] }
  ];

  beforeAll(() => {
    // Мокаем readFileSync: отдаём JSON по имени файла
    jest.spyOn(fs, 'readFileSync').mockImplementation((fname, enc) => {
      const f = String(fname);
      if (f.endsWith('movies.ru.json'))  return JSON.stringify(dataRU);
      if (f.endsWith('movies.en.json'))  return JSON.stringify(dataEN);
      return realRead(fname, enc);
    });
    // Мокаем writeFileSync, чтобы не писать на диск
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterAll(() => {
    fs.readFileSync.mockRestore();
    fs.writeFileSync.mockRestore();
  });

  // Импортим app только после установки шпионов,
  // чтобы server.js взял замоканный fs
  const app = require('../server');

  test('GET /api/movies/all (en по умолчанию) -> lang cookie + JSON', async () => {
    const request = require('supertest');
    const res = await request(app).get('/api/movies/all');

    expect(res.statusCode).toBe(200);
    expect(res.body.meta.lang).toBe('en');
    expect(res.body.items.length).toBe(dataEN.length);

    const setCookie = res.headers['set-cookie'] || [];
    const hasLang = setCookie.some(c => /^lang=en;/.test(c));
    expect(hasLang).toBe(true);
  });

  test('GET /api/movies/all?lang=ru -> ru данные и lang=ru cookie', async () => {
    const request = require('supertest');
    const res = await request(app).get('/api/movies/all?lang=ru');

    expect(res.statusCode).toBe(200);
    expect(res.body.meta.lang).toBe('ru');
    expect(res.body.items.length).toBe(dataRU.length);

    const setCookie = res.headers['set-cookie'] || [];
    const hasLang = setCookie.some(c => /^lang=ru;/.test(c));
    expect(hasLang).toBe(true);
  });

  test('GET /api/movies?title=cin -> фильтр по title (en)', async () => {
    const request = require('supertest');
    const res = await request(app).get('/api/movies').query({ title: 'cin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.meta.mode).toBe('title');
    // В наших EN фикстурах 'Cinema' матчится
    expect(res.body.items.map(x => x.title)).toEqual(['Cinema']);
  });

  test('GET /api/movies без title и без ids -> 400', async () => {
    const request = require('supertest');
    const res = await request(app).get('/api/movies');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  test('GET /api/movies?ids=1,5,999 -> выборка по id (из en по умолчанию)', async () => {
    const request = require('supertest');
    const res = await request(app).get('/api/movies').query({ ids: '1,5,999' });
    expect(res.statusCode).toBe(200);
    expect(res.body.meta.mode).toBe('ids');
    // Т.к. язык по умолчанию en, id=5 присутствует, id=1 (есть в ru) — не попадёт
    expect(res.body.items.map(x => x.id)).toEqual([5]);
  });

  test('POST /api/movies -> создаёт запись в ru+en, id = max(ru,en)+1', async () => {
    const request = require('supertest');
    const body = {
      title_ru: 'Новый',
      title_en: 'New',
      year: 2020,
      genres: 'drama,comedy',
      director: 'John D.',
      rating: 7.5
    };
    const res = await request(app).post('/api/movies').send(body);
    expect(res.statusCode).toBe(201);

    // max id среди фикстур = 5 => ожидаем 6
    expect(res.body.item_ru.id).toBe(6);
    expect(res.body.item_en.id).toBe(6);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    const calls = fs.writeFileSync.mock.calls.map(c => path.basename(c[0]));
    expect(calls.sort()).toEqual(['movies.en.json', 'movies.ru.json'].sort());
  });
});
