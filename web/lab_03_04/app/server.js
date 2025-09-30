// app/server.js
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

const PORT = parseInt(process.env.PORT || "3000", 10);
const API_PREFIX = process.env.API_PREFIX || "/api";
const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE || "50", 10);
const DEFAULT_LANG = String(process.env.DEFAULT_LANG || "en").toLowerCase();

const SUPPORTED = new Set(["en", "ru"]);
const cache = new Map(); // lang -> movies[]

function normLang(x) {
  const s = String(x || "").toLowerCase().slice(0, 2);
  return SUPPORTED.has(s) ? s : DEFAULT_LANG;
}

function pickLang(req) {
  if (req.query.lang) return normLang(req.query.lang);
  const cookie = (req.headers.cookie || "").match(/(?:^|;\s*)lang=([a-z\-]+)/i)?.[1];
  if (cookie) return normLang(cookie);
  const al = req.headers["accept-language"];
  if (al) return normLang(al.split(",")[0]);
  return DEFAULT_LANG;
}

function loadMovies(lang) {
  if (cache.has(lang)) return cache.get(lang);
  const file = path.join(__dirname, `movies.${lang}.json`);
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`[FATAL] Cannot read ${file}:`, e.message);
    cache.set(lang, null);
    return null;
  }
  cache.set(lang, data);
  return data;
}

function parseIdsParam(ids) {
  // "1,2,3" -> [1,2,3] без NaN, без дублей, с сохранением порядка
  const seen = new Set();
  const out = [];
  String(ids).split(",").forEach(s => {
    const n = parseInt(s, 10);
    if (Number.isFinite(n) && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  });
  return out;
}

// Единый эндпоинт в двух режимах:
// 1) ?ids=1,2,5&lang=ru  -> вернуть фильмы по id в заданной локали
// 2) ?title=матрица&lang=ru -> поиск по названию в заданной локали
app.get(`${API_PREFIX}/movies`, (req, res) => {
  const lang = pickLang(req);
  const dataset = loadMovies(lang);
  if (!dataset) {
    return res.status(500).json({
      error: lang === "ru" ? "Сервер: файл фильмов не найден" : "Server: movies file missing",
      lang
    });
  }

  const { ids, title } = req.query;

  // Режим 1: выбор по ids (для "перевода" текущей выдачи)
  if (ids) {
    const idList = parseIdsParam(ids);
    const items = idList.map(id => dataset.find(m => m.id === id)).filter(Boolean);
    res.setHeader("Set-Cookie", `lang=${lang}; Path=/; Max-Age=31536000`);
    return res.json({ meta: { lang, mode: "ids", count: items.length, ids: idList }, items });
  }

  // Режим 2: поиск по title
  if (!title || !String(title).trim()) {
    const msg = lang === "ru" ? 'Требуется параметр "title"' : 'Query param "title" is required';
    return res.status(400).json({ error: msg, lang });
  }
  const q = String(title).toLowerCase();
  const items = dataset
    .filter(m => (m.title || "").toLowerCase().includes(q))
    .slice(0, DEFAULT_PAGE_SIZE);

  res.setHeader("Set-Cookie", `lang=${lang}; Path=/; Max-Age=31536000`);
  res.json({ meta: { lang, mode: "title", count: items.length }, items });
});

// 404 только для /api
app.use(API_PREFIX, (req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`Movies API :${PORT} prefix=${API_PREFIX} defaultLang=${DEFAULT_LANG}`);
});
