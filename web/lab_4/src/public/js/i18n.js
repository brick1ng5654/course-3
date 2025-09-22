// Клиентская реализация локализации
const translations = {
    'ru': {
        'welcome': 'Добро пожаловать!',
        'homeTitle': 'Главная страница',
        'viewAllItems': 'Все элементы',
        'createItem': 'Создать элемент',
        'systemInfo': 'Системная информация',
        'itemName': 'Название элемента',
        'itemValue': 'Значение элемента',
        'createButton': 'Создать',
        'refreshButton': 'Обновить',
        'itemCreated': 'Элемент успешно создан!',
        'errorOccurred': 'Произошла ошибка',
        'showItemById': 'Показать элементы по id',
        'chooseMove': 'Выберите действие в меню навигации выше.',
        'currentUrl': 'Текущий URL: ',
        'title': 'Лабораторная работа',
        'res': 'Результат',
        'enterName': 'Введите название',
        'enterValue': 'Введите числовое значение',
        'showRes': 'Здесь будет отображен результат создания...',
        'lastEl': 'Последние созданные элементы',
        'reloadList': '🔄 Обновить список',
        'loadEl': 'Загрузить элемент',
        'loadEls': 'Загрузить все элементы',
        'allEl': 'Все элементы',
        'El150': 'Элементы ≥ 150'
    },
    'en': {
        'welcome': 'Welcome!',
        'homeTitle': 'Home Page', 
        'viewAllItems': 'All Items',
        'createItem': 'Create Item',
        'systemInfo': 'System Information',
        'itemName': 'Item Name',
        'itemValue': 'Item Value',
        'createButton': 'Create',
        'refreshButton': 'Refresh',
        'itemCreated': 'Item created successfully!',
        'errorOccurred': 'An error occurred',
        'showItemById': 'Show item by id',
        'chooseMove': 'Choose a move uppon this message.',
        'currentUrl': 'Current URL: ',
        'title': 'Lab work',
        'res': 'Results',
        'enterName': 'Enter a name',
        'enterValue': 'Enter a digital value',
        'showRes': 'Will be showen the result here...',
        'lastEl': 'Last created elements',
        'reloadList': '🔄 Reload list',
        'loadEl': 'Load an element',
        'loadEls': 'Load all elements',
        'allEl': 'All elements',
        'El150': 'Elements ≥ 150'
    }
};

function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ru';
}

function setLanguage(lang) {
    if (translations[lang]) {
        localStorage.setItem('language', lang);
        applyTranslations();
    }
}

function applyTranslations() {
    const lang = getCurrentLanguage();
    const t = translations[lang];
    
    // Обновляем тексты
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // Обновляем placeholder'ы
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            element.placeholder = t[key];
        }
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    applyTranslations();
    
    // Обработчики для переключателя языка
    document.querySelectorAll('.language-switcher a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
});