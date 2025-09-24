// Локализация
console.log('=== Локализация запущена ===');

let currentLang = 'ru';

//загрузка локализации
async function loadTranslations(lang) {
    try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) throw new Error('Ошибка загрузки');
        return await response.json();//преобразуем JSON-ответ в JavaScript-объект
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

function applyTranslations(translations) {
    if (!translations) {
        console.error('Нет переводов для применения');
        return;
    }
    
    // Перевод текстовых элементов
    const elements = document.querySelectorAll('[data-i18n]'); //назодим все элементы с атрибутом
    console.log('Найдено элементов для перевода:', elements.length);
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key]; //заменяем текст по ключу
            console.log(`Переведен ${key}: ${translations[key]}`);
        } else {
            console.warn(`Перевод не найден для ключа: ${key}`);
        }
    });
    
    // Перевод плейсхолдеров (Аналогично переводу для обычного текста )
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    console.log('Найдено плейсхолдеров для перевода:', placeholders.length);
    
    placeholders.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            element.placeholder = translations[key];
            console.log(`Переведен плейсхолдер ${key}: ${translations[key]}`);
        } else {
            console.warn(`Перевод не найден для плейсхолдера: ${key}`);
        }
    });
}

// Главная функция кнопок
window.switchLanguage = async function(lang) {
    console.log('Переключаем на:', lang);
    const translations = await loadTranslations(lang); //сюда сохраняется нас json
    if (translations) {
        applyTranslations(translations);
        localStorage.setItem('preferredLanguage', lang); //сохраняем выюбор языка
        
        const langInput = document.getElementById('langInput');
        if (langInput) langInput.value = lang;
        
        // Обновляем URL
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({}, '', url);//обновляем  страницу без ее перезагрузки
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', async function() {
    //Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    //Проверяем сохраненный язык в браузере
    const savedLang = localStorage.getItem('preferredLanguage');
    //Определяем приоритет языка
    const lang = urlLang || savedLang || 'ru';
    //Загружаем и применяем переводы
    const translations = await loadTranslations(lang);
    if (translations) applyTranslations(translations);
});

// alert
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById("Hbtn");
    if (button) {
        button.onclick = function(){ alert("Инструкции нету ;("); };
    }
});

console.log('Функция switchLanguage:', typeof window.switchLanguage);