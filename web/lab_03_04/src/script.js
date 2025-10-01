// src/script.js
console.log("Movies UI: search-by-title + translate-by-ids", new Date().toLocaleString());

function $(sel) { return document.querySelector(sel); }
function api(path) { return fetch(path).then(r => r.json()); }

// --- URL helpers ---
function getParam(name) {
  return new URLSearchParams(location.search).get(name) || "";
}
function setParams(obj, opts) {
  var replace = opts && opts.replace === true;
  var url = new URL(location.href);
  Object.keys(obj).forEach(function (k) {
    var v = obj[k];
    if (v === null || v === undefined || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  });
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
}

// --- Lang + i18n ---
function detectLang() {
  return getParam("lang")
      || localStorage.getItem("lang")
      || (navigator.language || "en").slice(0, 2)
      || "en";
}
var lang = (["ru","en"].indexOf(detectLang()) >= 0) ? detectLang() : "en";
var dict = null;
var lastIds = []; // запоминаем id текущей выдачи

async function loadStrings() {
  try {
    dict = await fetch(`/i18n/${lang}.json`).then(r => r.json());
  } catch {
    dict = (lang === "ru")
      ? { app_title: "Около Кино", search_placeholder: "Введите название фильма…", search_button: "Искать", no_results: "Ничего не найдено" }
      : { app_title: "About movies", search_placeholder: "Enter movie title…", search_button: "Search", no_results: "No results" };
  }

  document.title = dict.app_title;

  const map = [
    ["#app_title", "app_title"],
    ["#h1_title",  "app_title"],
    ["#search_btn","search_button"]
  ];
  for (const [sel, key] of map) {
    const el = document.querySelector(sel);
    if (el && dict[key] !== undefined) el.textContent = dict[key];
  }

  const q = document.querySelector("#q");
  if (q && dict.search_placeholder) q.placeholder = dict.search_placeholder;
}

// --- Render ---
function render(items) {
  var box = $("#results");
  if (!Array.isArray(items) || items.length === 0) {
    box.innerHTML = "<p>" + (dict ? (dict.no_results || "No results") : "No results") + "</p>";
    lastIds = [];
    return;
  }
  var html = items.map(function(m){
    return (
      '<div style="border:1px solid #ccc; padding:12px; border-radius:10px; margin:10px 0;">' +
        '<h3 style="margin:0 0 6px;">' + m.title + ' <small>(' + m.year + ')</small></h3>' +
        '<div><b>Genres:</b> ' + ((m.genres||[]).join(", ")) + '</div>' +
        '<div><b>Director:</b> ' + (m.director || "-") + '</div>' +
        '<div><b>Rating:</b> ' + (m.rating != null ? m.rating : "-") + '</div>' +
      '</div>'
    );
  }).join("");
  box.innerHTML = html;
  lastIds = items.map(function(m){ return m.id; });
}

// --- выбрать title на новой локали для адресной строки ---
function chooseSearchTitle(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items[0].title || "";
}

// --- API runners ---
function runSearchByTitle(title) {
  if (!title) {
    document.querySelector("#results").innerHTML = "";
    lastIds = [];
    return Promise.resolve();
  }
  return api(`/api/movies?title=${encodeURIComponent(title)}&lang=${lang}`)
    .then(data => { render(data.items); });
}

function isFiniteNumber(n){ return typeof n === "number" && isFinite(n); }

function runFetchByIds(ids) {
  if (!ids || ids.length === 0) return Promise.resolve({ items: [] });
  var qs = "/api/movies?ids=" + ids.join(",") + "&lang=" + lang;
  return api(qs).then(function(data){
    render(data.items);
    return data; // чтобы взять локализованный title
  });
}

// --- Init ---
document.addEventListener("DOMContentLoaded", function() {
  if (getParam("lang") !== lang) setParams({ lang: lang }, { replace: true });
  localStorage.setItem("lang", lang);

  loadStrings().then(function(){
    var initialTitle = getParam("title");
    var idsParam = getParam("ids");
    var qEl = $("#q");
    if (qEl) qEl.value = initialTitle;

    if (idsParam) {
      var arr = idsParam.split(",").map(function(s){ return parseInt(s,10); }).filter(isFiniteNumber);
      runFetchByIds(arr);
    } else if (initialTitle) {
      runSearchByTitle(initialTitle);
    } else {
      var hint = $("#hint");
      if (hint) hint.textContent = dict.prompt_type_title || "Type a movie title";
    }

    // Переключение языка (кнопки с data-lang="en"/"ru")
    document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const newLang = btn.getAttribute("data-lang");
      if (newLang === lang) return;
      lang = newLang;
      localStorage.setItem("lang", lang);

      // 1) Сразу обновляем UI-тексты
      await loadStrings();

      if (lastIds.length > 0) {
        // 2) Тихо получаем те же фильмы в новой локали
        const data = await runFetchByIds(lastIds);
        // 3) Выбираем title для адресной строки
        const chosenTitle = chooseSearchTitle(data.items);
        // 4) Обновляем URL на ?lang=...&title=..., ids чистим
        setParams({ lang, title: chosenTitle, ids: "" });
        // 5) Повторяем поиск по title (для консистентности URL и выдачи)
        await runSearchByTitle(chosenTitle);
        const q = document.querySelector("#q");
        if (q) q.value = chosenTitle;
      } else {
        // Нет результатов — просто сменили язык, UI уже обновлён
        setParams({ lang, ids: "" });
        const qv = (document.querySelector("#q")?.value || "").trim();
        if (qv) await runSearchByTitle(qv);
      }
    });
  });


    // Поиск по форме
    var form = $("#search-form");
    if (form) {
      form.addEventListener("submit", function(e){
        e.preventDefault();
        var qvEl = $("#q");
        var title = qvEl ? (qvEl.value || "").trim() : "";
        setParams({ title: title, lang: lang, ids: "" });
        runSearchByTitle(title);
      });
    }
  });
});

// Навигация назад/вперёд
window.addEventListener("popstate", function() {
  var t = getParam("title");
  var l = getParam("lang");
  var idsParam = getParam("ids");
  if (l && l !== lang) {
    lang = l;
    loadStrings().then(function(){
      var qEl = $("#q"); if (qEl) qEl.value = t;
      if (idsParam) {
        var arr = idsParam.split(",").map(function(s){ return parseInt(s,10); }).filter(isFiniteNumber);
        runFetchByIds(arr);
      } else {
        runSearchByTitle(t);
      }
    });
  } else {
    var qEl2 = $("#q"); if (qEl2) qEl2.value = t;
    if (idsParam) {
      var arr2 = idsParam.split(",").map(function(s){ return parseInt(s,10); }).filter(isFiniteNumber);
      runFetchByIds(arr2);
    } else {
      runSearchByTitle(t);
    }
  }
});
