// src/i18n-utils.js - Утилиты для интернационализации (использует существующую логику из script.js)

var dict = null;

// Функция для получения переведенной строки
function t(key) {
  return dict && dict[key] !== undefined ? dict[key] : key;
}

// Инициализация интернационализации (использует существующую логику)
async function initI18n() {
  // Используем существующую логику из script.js
  await loadStrings();
  updatePageTranslations();

  // Добавляем кнопки переключения языка в header (как в index.html)
  const header = document.querySelector('.header');
  if (header) {
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = createLangButtons();
    header.appendChild(toolbar);
  }

  // Настраиваем обработчики для кнопок переключения языка (используем существующую логику)
  setupLangButtonHandlers();
}

// Функция для настройки обработчиков кнопок языка (использует существующую логику из script.js)
function setupLangButtonHandlers() {
  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const newLang = btn.getAttribute("data-lang");
      if (!["ru","en"].includes(newLang) || newLang === getCurrentLang()) return;

      // Используем существующую логику из script.js
      setParams({ lang: newLang }, { replace: true });
      localStorage.setItem("lang", newLang);

      // Перезагружаем переводы и обновляем страницу
      await loadStrings();
      updatePageTranslations();
      
      // Обновляем кнопки языка
      const header = document.querySelector('.header');
      if (header) {
        const toolbar = header.querySelector('.toolbar');
        if (toolbar) {
          toolbar.innerHTML = createLangButtons();
          setupLangButtonHandlers(); // Переподключаем обработчики
        }
      }
      
      // Если это страница настроек, обновляем форму
      if (document.getElementById('prefs-form')) {
        updatePrefsForm();
      }
      
      // Если это страница просмотра, перезагружаем данные
      if (document.getElementById('info')) {
        loadViewData();
      }
    });
  });
}

// Функция для создания кнопок переключения языка (как в index.html)
function createLangButtons() {
  const currentLang = getCurrentLang();
  
  return `
    <span class="muted">${t('label_lang')}</span>
    <button type="button" class="langbtn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
    <button type="button" class="langbtn ${currentLang === 'ru' ? 'active' : ''}" data-lang="ru">RU</button>
  `;
}

// Функция для обновления элементов страницы с переводами
function updatePageTranslations() {
  if (!dict) return;
  
  // Обновляем заголовок страницы
  const titleEl = document.querySelector('title');
  if (titleEl) {
    titleEl.textContent = dict.prefs_title || dict.view_title || 'Page';
  }
  
  // Обновляем заголовок h1
  const h1El = document.querySelector('h1');
  if (h1El) {
    h1El.textContent = dict.prefs_heading || dict.view_heading || 'Page';
  }
  
  // Обновляем ссылку "На главную"
  const homeLink = document.querySelector('a.brand');
  if (homeLink) {
    homeLink.textContent = dict.brand_home || 'Home';
  }
}

// Функция для обновления формы настроек
function updatePrefsForm() {
  if (!dict || !document.getElementById('prefs-form')) return;
  
  // Обновляем лейблы и плейсхолдеры
  const usernameLabel = document.querySelector('label[for="username"]');
  if (usernameLabel) usernameLabel.textContent = t('prefs_username_label');
  
  const usernameInput = document.getElementById('username');
  if (usernameInput) usernameInput.placeholder = t('prefs_username_placeholder');
  
  const colorLabel = document.querySelector('label[for="color"]');
  if (colorLabel) colorLabel.textContent = t('prefs_color_label');
  
  const colorInput = document.getElementById('color');
  if (colorInput) colorInput.placeholder = t('prefs_color_placeholder');
  
  // Исправляем интернационализацию чекбокса "запомнить на 7 дней"
  const persistCheckbox = document.getElementById('persist');
  if (persistCheckbox) {
    const persistLabel = persistCheckbox.parentElement;
    if (persistLabel && persistLabel.tagName === 'LABEL') {
      // Обновляем только текстовую часть label, сохраняя чекбокс
      const textNode = Array.from(persistLabel.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
      if (textNode) {
        textNode.textContent = ` ${t('prefs_persist_label')}`;
      }
    }
  }
  
  const saveButton = document.querySelector('.btn.primary');
  if (saveButton) saveButton.textContent = t('prefs_save_button');
  
  const viewButton = document.querySelector('a[href="/view.html"]');
  if (viewButton) viewButton.textContent = t('prefs_view_button');
}

// Функция для загрузки данных на странице просмотра
async function loadViewData() {
  if (!document.getElementById('info')) return;
  
  const info = document.getElementById('info');
  info.innerHTML = `<p>${t('view_loading')}</p>`;
  
  try {
    const [prefsRes, sessRes] = await Promise.all([
      fetch('/api/prefs'), fetch('/api/session')
    ]);
    const prefs = await prefsRes.json();
    const sess  = await sessRes.json();

    const username = prefs?.prefs?.username || t('view_not_set');
    const color    = prefs?.prefs?.color || '#ffffff';
    document.body.style.background = color;

    info.innerHTML = `
      <h3>${t('view_cookie_title')}</h3>
      <div><b>${t('view_username_label')}</b> ${username}</div>
      <div><b>${t('view_color_label')}</b> ${color}</div>
      <hr>
      <h3>${t('view_session_title')}</h3>
      <div><b>${t('view_session_id_label')}</b> ${sess?.session?.id || '-'}</div>
      <div><b>${t('view_visits_label')}</b> ${sess?.session?.visits ?? 0}</div>
      <div><b>${t('view_last_visit_label')}</b> ${sess?.session?.lastVisit || '-'}</div>
      <div><b>${t('view_created_at_label')}</b> ${sess?.session?.createdAt || '-'}</div>
    `;
  } catch (e) {
    info.innerHTML = `<div class="status err">${t('view_error_prefix')}${e.message}</div>`;
  }
}
