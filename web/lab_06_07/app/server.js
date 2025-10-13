// app/server.js
const fs = require("fs");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

const PORT = parseInt(process.env.PORT || "3000", 10);
const API_PREFIX = process.env.API_PREFIX || "/api";
const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE || "50", 10);
const DEFAULT_LANG = String(process.env.DEFAULT_LANG || "en").toLowerCase();

const SUPPORTED = new Set(["en","ru"]);
const cache = new Map();

const GENRE_LABELS = {
  ru: { action:"Боевик", scifi:"Фантастика", drama:"Драма", comedy:"Комедия", thriller:"Триллер", animation:"Анимация" },
  en: { action:"Action", scifi:"Sci-Fi",    drama:"Drama", comedy:"Comedy",  thriller:"Thriller",  animation:"Animation" }
};

// ---------- общие миддлвары ----------
app.set("trust proxy", 1);               // за nginx
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Сессии (dev: MemoryStore ок; для прода нужен внешний стор)
app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET || "dev_change_me",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,         // мы ниже установим динамически по X-Forwarded-Proto
    maxAge: 30 * 60 * 1000 // 30 минут простоя, как в методичке по умолчанию у Tomcat
  }
}));

// Динамическая настройка secure-cookie за nginx https
app.use((req, res, next) => {
  const isHttps = (req.headers["x-forwarded-proto"] || "").toLowerCase() === "https";
  if (isHttps) req.session.cookie.secure = true;
  next();
});

// Счётчики на сессии: visits + lastVisit
app.use((req, res, next) => {
  const nowIso = new Date().toISOString();
  if (typeof req.session.visits !== "number") req.session.visits = 0;
  req.session.visits += 1;
  if (!req.session.createdAt) req.session.createdAt = nowIso;
  // lastVisit = предыдущее посещение
  if (!req.session.now) req.session.now = nowIso;
  req.session.lastVisit = req.session.now;
  req.session.now = nowIso;
  next();
});

// ---------- утилиты ----------
function normLang(x){
  const s = String(x||"").toLowerCase().slice(0,2);
  return SUPPORTED.has(s) ? s : DEFAULT_LANG;
}
function pickLang(req){
  if (req.query.lang) return normLang(req.query.lang);
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)lang=([a-z\-]+)/i);
  return m ? normLang(m[1]) : DEFAULT_LANG;
}
function loadMovies(lang){
  if (cache.has(lang)) return cache.get(lang);
  const file = path.join(__dirname, `movies.${lang}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    cache.set(lang, data);
    return data;
  } catch(e){
    console.error(`[FATAL] read ${file}:`, e.message);
    cache.set(lang, null);
    return null;
  }
}
function saveMovies(lang, list){
  const file = path.join(__dirname, `movies.${lang}.json`);
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
  cache.set(lang, list);
}
function loadBoth(){ return { ru: loadMovies("ru"), en: loadMovies("en") }; }
function nextIdFromBoth(ru, en){
  const maxRu = Array.isArray(ru) ? ru.reduce((m,x)=>Math.max(m, +x.id||0), 0) : 0;
  const maxEn = Array.isArray(en) ? en.reduce((m,x)=>Math.max(m, +x.id||0), 0) : 0;
  return Math.max(maxRu, maxEn) + 1;
}
function parseIdsParam(ids){
  const seen=new Set(), out=[];
  String(ids).split(",").forEach(s=>{
    const n=parseInt(s,10);
    if (Number.isFinite(n) && !seen.has(n)) { seen.add(n); out.push(n); }
  });
  return out;
}

// ---------- РОУТЫ ЛР-7: Cookies + Session ----------

// POST /api/prefs — сохранить имя пользователя и цвет в Cookie
// body: { username, color, persistDays? }
// persistDays: если задано — постоянные cookie, иначе — только на сессию
app.post(`${API_PREFIX}/prefs`, (req, res) => {
  const username = String(req.body?.username || "").trim();
  let color = String(req.body?.color || "").trim();
  const persistDays = Number.isFinite(+req.body?.persistDays) ? +req.body.persistDays : null;

  if (!username) return res.status(400).json({ error: 'Field "username" is required' });

  // простая валидация цвета
  const validHex = /^#?[0-9a-f]{6}$/i.test(color);
  if (!validHex) color = "#ffffff";
  if (!color.startsWith("#")) color = "#" + color;

  const isHttps = (req.headers["x-forwarded-proto"] || "").toLowerCase() === "https";
  const cookieBase = {
    path: "/",
    sameSite: "lax",
    httpOnly: false, // чтобы фронт мог прочитать при желании; для безопасности лучше true + читать через /api/prefs
    secure: isHttps
  };
  const age = persistDays ? persistDays * 24 * 60 * 60 * 1000 : undefined; // ms

  const optUser = { ...cookieBase, ...(age ? { maxAge: age } : {}) };
  const optColor = { ...cookieBase, ...(age ? { maxAge: age } : {}) };

  res.cookie("username", encodeURIComponent(username), optUser);
  res.cookie("page.color", encodeURIComponent(color), optColor);

  // заодно установим куку с языком (текущий механизм уже это делает, но пусть будет тут)
  const lang = pickLang(req);
  res.cookie("lang", lang, { ...cookieBase, maxAge: 365*24*60*60*1000 });

  return res.json({ ok: true, cookies: { username, color, lang } });
});

// GET /api/prefs — отдать содержимое куки (username, color)
app.get(`${API_PREFIX}/prefs`, (req, res) => {
  const raw = req.cookies || {};
  const out = {
    username: raw["username"] ? decodeURIComponent(raw["username"]) : null,
    color: raw["page.color"] ? decodeURIComponent(raw["page.color"]) : null,
    lang: raw["lang"] || null
  };
  res.json({ prefs: out });
});

// GET /api/session — отдать переменные сессии (visits, lastVisit, id)
app.get(`${API_PREFIX}/session`, (req, res) => {
  res.json({
    session: {
      id: req.sessionID,
      visits: req.session.visits || 0,
      lastVisit: req.session.lastVisit || null,
      createdAt: req.session.createdAt || null
    }
  });
});

// ---------- ТВОИ РОУТЫ MOVIES (из ЛР-6) ----------
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

app.get(`${API_PREFIX}/movies/all`, (req, res) => {
  const lang = pickLang(req);
  const dataset = loadMovies(lang);
  if (!dataset) return res.status(500).json({ error: "Movies file missing", lang });
  res.setHeader("Set-Cookie", `lang=${lang}; Path=/; Max-Age=31536000`);
  res.json({ meta: { lang, count: dataset.length }, items: dataset });
});

app.post(`${API_PREFIX}/movies`, (req, res) => {
  const { ru, en } = loadBoth();
  if (!ru || !en) return res.status(500).json({ error: "Movies files missing" });

  const title_ru = String(req.body?.title_ru || "").trim();
  const title_en = String(req.body?.title_en || "").trim();
  if (!title_ru || !title_en) return res.status(400).json({ error: 'Fields "title_ru" and "title_en" are required' });

  const year = req.body?.year ? Number(req.body.year) : null;
  let genres = req.body?.genres;
  if (typeof genres === "string") genres = genres.split(",").map(s => s.trim()).filter(Boolean);
  if (!Array.isArray(genres)) genres = [];
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

// 404 для /api/*
app.use(API_PREFIX, (req, res) => res.status(404).json({ error: "Not found" }));

// ---------- старт ----------
app.listen(PORT, () => {
  console.log(`Movies API :${PORT} prefix=${API_PREFIX} defaultLang=${DEFAULT_LANG}`);
});
