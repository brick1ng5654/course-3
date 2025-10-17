// app/server.js
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

const PORT = parseInt(process.env.PORT || "3000", 10);
const API_PREFIX = process.env.API_PREFIX || "/api";
const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE || "50", 10);
const DEFAULT_LANG = String(process.env.DEFAULT_LANG || "").toLowerCase();

const SUPPORTED = new Set(["en", "ru"]);
const cache = new Map();

// Жанры: код чекбокса -> подпись на языке
const GENRE_LABELS = {
  ru: {
    action: "Боевик",
    scifi: "Фантастика",
    drama: "Драма",
    comedy: "Комедия",
    thriller: "Триллер",
    animation: "Анимация"
  },
  en: {
    action: "Action",
    scifi: "Sci-Fi",
    drama: "Drama",
    comedy: "Comedy",
    thriller: "Thriller",
    animation: "Animation"
  }
};

// ===== МИДДЛВАРЫ ДОЛЖНЫ БЫТЬ СРАЗУ =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===== УТИЛИТЫ/ЗАГРУЗКА =====
function normLang(x){ const s = String(x||"").toLowerCase().slice(0,2); return SUPPORTED.has(s) ? s : DEFAULT_LANG; }
function pickLang(req){ if (req.query.lang) return normLang(req.query.lang);
  const cookie = (req.headers.cookie || "").match(/(?:^|;\s*)lang=([a-z\-]+)/i)?.[1];
  return cookie ? normLang(cookie) : DEFAULT_LANG; }
function loadMovies(lang){
  if (cache.has(lang)) return cache.get(lang);
  const file = path.join(__dirname, `movies.${lang}.json`);
  try { const data = JSON.parse(fs.readFileSync(file, "utf8")); cache.set(lang, data); return data; }
  catch(e){ console.error(`[FATAL] Cannot read ${file}:`, e.message); cache.set(lang, null); return null; }
}
function saveMovies(lang, list){ const file = path.join(__dirname, `movies.${lang}.json`);
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8"); cache.set(lang, list); }
function loadBoth(){ return { ru: loadMovies("ru"), en: loadMovies("en") }; }
function nextIdFromBoth(ru, en){
  const maxRu = Array.isArray(ru) ? ru.reduce((m,x)=>Math.max(m, +x.id||0), 0) : 0;
  const maxEn = Array.isArray(en) ? en.reduce((m,x)=>Math.max(m, +x.id||0), 0) : 0;
  return Math.max(maxRu, maxEn) + 1;
}
function parseIdsParam(ids){ const seen=new Set(), out=[];
  String(ids).split(",").forEach(s=>{ const n=parseInt(s,10); if (Number.isFinite(n)&&!seen.has(n)){ seen.add(n); out.push(n); }});
  return out;
}

// ===== РОУТЫ =====

// GET /api/movies?ids=... | ?title=...
app.get(`${API_PREFIX}/movies`, (req, res) => {
  const lang = pickLang(req);
  const dataset = loadMovies(lang);
  if (!dataset) return res.status(500).json({ error: "Movies file missing", lang });

  const { ids, title } = req.query;

  if (ids) {
    const idList = parseIdsParam(ids);
    const items = idList.map(id => dataset.find(m => m.id === id)).filter(Boolean);
    res.setHeader("Set-Cookie", `lang=${lang}; Path=/; Max-Age=31536000`);
    return res.json({ meta: { lang, mode: "ids", count: items.length, ids: idList }, items });
  }

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'Query param "title" is required', lang });
  }
  const q = String(title).toLowerCase();
  const items = dataset.filter(m => (m.title || "").toLowerCase().includes(q)).slice(0, DEFAULT_PAGE_SIZE);
  res.setHeader("Set-Cookie", `lang=${lang}; Path=/; Max-Age=31536000`);
  res.json({ meta: { lang, mode: "title", count: items.length }, items });
});

// GET /api/movies/all?lang=ru|en  (для all.html)
app.get(`${API_PREFIX}/movies/all`, (req, res) => {
  const lang = pickLang(req);
  const dataset = loadMovies(lang);
  if (!dataset) return res.status(500).json({ error: "Movies file missing", lang });
  res.setHeader("Set-Cookie", `lang=${lang}; Path=/; Max-Age=31536000`);
  res.json({ meta: { lang, count: dataset.length }, items: dataset });
});

// POST /api/movies  (добавить запись сразу в ru+en)
app.post(`${API_PREFIX}/movies`, (req, res) => {
  const { ru, en } = loadBoth();
  if (!ru || !en) return res.status(500).json({ error: "Movies files missing" });

  const title_ru = String(req.body?.title_ru || "").trim();
  const title_en = String(req.body?.title_en || "").trim();
  if (!title_ru || !title_en) return res.status(400).json({ error: 'Fields "title_ru" and "title_en" are required' });

  const year = req.body?.year ? Number(req.body.year) : null;
  // genres могут прийти как строка с кодами ("action, scifi") или массив
  let genres = req.body?.genres;
  if (typeof genres === "string") genres = genres.split(",").map(s => s.trim()).filter(Boolean);
  if (!Array.isArray(genres)) genres = [];

  // Преобразуем кодовые значения в подписи для каждой локали
  const ruGenres = genres.map(code => GENRE_LABELS.ru[code] || code);
  const enGenres = genres.map(code => GENRE_LABELS.en[code] || code);
  const director = String(req.body?.director || "").trim() || null;
  const rating = (req.body?.rating !== undefined && req.body.rating !== null) ? Number(req.body.rating) : null;

  const id = nextIdFromBoth(ru, en);
  const ruMovie = { id, year, genres: ruGenres, director, rating, title: title_ru };
  const enMovie = { id, year, genres: enGenres, director, rating, title: title_en };

  ru.push(ruMovie);  en.push(enMovie);
  saveMovies("ru", ru); saveMovies("en", en);

  res.status(201).json({ meta: { created_in: ["ru","en"] }, item_ru: ruMovie, item_en: enMovie });
});

// ===== 404 ДОЛЖЕН БЫТЬ САМЫМ ПОСЛЕДНИМ ДЛЯ /api =====
app.use(API_PREFIX, (req, res) => res.status(404).json({ error: "Not found" }));

// ===== СТАРТ =====
app.listen(PORT, () => {
  console.log(`Movies API :${PORT} prefix=${API_PREFIX} defaultLang=${DEFAULT_LANG}`);
});
