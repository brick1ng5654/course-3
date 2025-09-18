const express = require("express");
require("dotenv").config();

const PORT = Number(process.env.PORT || 3000);
const APP_TITLE = String(process.env.APP_TITLE || "Movies");
const DEFAULT_LIMIT = Number(process.env.DEFAULT_LIMIT || 3);

const MOVIES = [
  { id:1, title:"The Matrix", year:1999 },
  { id:2, title:"Inception", year:2010 },
  { id:3, title:"Interstellar", year:2014 },
  { id:4, title:"The Dark Knight", year:2008 },
  { id:5, title:"Fight Club", year:1999 }
];

const app = express();

app.get("/api/hello", (_req, res) => res.json({ message:`Hello from ${APP_TITLE} API!` }));

app.get("/api/config", (_req, res) => res.json({ PORT, APP_TITLE, DEFAULT_LIMIT }));

app.get("/api/search", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  const limit = Math.max(1, Number(req.query.limit || DEFAULT_LIMIT));
  const list = q
    ? MOVIES.filter(m => m.title.toLowerCase().includes(q))
    : MOVIES.slice();
  res.json({ items: list.slice(0, limit), total: list.length });
});

app.listen(PORT, () => console.log(`Movies API listening on ${PORT}`));
