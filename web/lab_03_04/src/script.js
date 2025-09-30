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

function loadStrings() {
  return fetch("/i18n/" + lang + ".json")
    .then(function(r){ return r.json(); })
    .then(function(d){ dict = d; })
    .catch(function(){
      dict = (lang === "ru")
        ? { app_title:"🎬 Фильмы", search_placeholder:"Введите название фильма…", search_button:"Искать", prompt_type_title:"Введите название фильма", no_results:"Ничего не найдено" }
        : { app_title:"🎬 Movies", search_placeholder:"Enter movie title…", search_button:"Search", prompt_type_title:"Type a movie title", no_results:"No results" };
    })
    .then(function(){
      document.title = dict.app_title;
      var el;
      el = $("#app_title"); if (el) el.textContent = dict.app_title;
      el = $("#h1_title");  if (el) el.textContent = dict.app_title;
      el = $("#search_btn"); if (el) el.textContent = dict.search_button;
      el = $("#q"); if (el) el.placeholder = dict.search_placeholder;
      el = $("#hint"); if (el) el.textContent = dict.prompt_type_title;
    });
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

// --- Вспомогалка: выбрать title на новой локали для адресной строки ---
function chooseSearchTitle(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  if (items.length === 1) return items[0].title || "";

  function tokenize(t) {
    return String(t || "")
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]+/gi, " ")
      .split(/\s+/)
      .filter(function(w){ return w.length >= 3; });
  }

  var tokenSets = items.map(function(m){ return new Set(tokenize(m.title)); });
  var common = Array.from(tokenSets[0]);
  for (var i = 1; i < tokenSets.length; i++) {
    common = common.filter(function(tok){ return tokenSets[i].has(tok); });
    if (common.length === 0) break;
  }
  if (common.length > 0) {
    common.sort(function(a,b){ return b.length - a.length; });
    return common[0];
  }
  return items[0].title || "";
}

// --- API runners ---
function runSearchByTitle(title) {
  if (!title) {
    var hint = $("#hint");
    if (hint) hint.textContent = (dict ? (dict.prompt_type_title || "Type a movie title") : "Type a movie title");
    $("#results").innerHTML = "";
    lastIds = [];
    return Promise.resolve();
  }
  return api("/api/movies?title=" + encodeURIComponent(title) + "&lang=" + lang)
    .then(function(data){
      var hint = $("#hint"); if (hint) hint.textContent = "";
      render(data.items);
    });
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
    var langBtns = document.querySelectorAll("[data-lang]");
    for (var i=0; i<langBtns.length; i++) {
      langBtns[i].addEventListener("click", function() {
        var newLang = this.getAttribute("data-lang");
        if (newLang === lang) return;
        lang = newLang;
        localStorage.setItem("lang", lang);

        if (lastIds.length > 0) {
          // 1) тихо берём те же фильмы в новой локали
          runFetchByIds(lastIds).then(function(data){
            // 2) выбираем title для адреса
            var chosenTitle = chooseSearchTitle(data.items);
            // 3) обновляем URL на ?lang=...&title=..., ids чистим
            setParams({ lang: lang, title: chosenTitle, ids: "" });
            // 4) повторяем поиск по title
            runSearchByTitle(chosenTitle).then(function(){
              var q = $("#q"); if (q) q.value = chosenTitle;
            });
          });
        } else {
          setParams({ lang: lang, ids: "" });
          loadStrings().then(function(){
            var qvEl = $("#q");
            var qv = qvEl ? (qvEl.value || "").trim() : "";
            if (qv) runSearchByTitle(qv);
          });
        }
      });
    }

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
