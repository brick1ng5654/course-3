// Импорт встроенных модулей Node.js
const http = require('http');      // Модуль для создания HTTP-сервера
const url = require('url');        // Модуль для парсинга URL
const fs = require('fs');          // Модуль для работы с файловой системой
const path = require('path');      // Модуль для работы с путями файлов

// 🔧 Создание HTTP-сервера
// Сервер будет обрабатывать ВСЕ входящие HTTP-запросы
const server = http.createServer((req, res) => {
    // 📨 Логируем каждый запрос для отладки
    console.log('📨 Получен запрос:', req.method, req.url);
    
    // 🔍 Парсим URL запроса
    // parsedUrl.query содержит параметры строки запроса (?name=value&age=123)
    const parsedUrl = url.parse(req.url, true);
    
    // 🎯 Обработка формы - ГЛАВНАЯ ЛОГИКА ЛАБОРАТОРНОЙ
    // Проверяем: запрос к /process И метод GET (данные в URL)
    if (parsedUrl.pathname === '/process' && req.method === 'GET') {
        console.log('✅ Обрабатываем форму с данными:', parsedUrl.query);
        
        // 📥 Извлекаем данные из URL параметров
        // || 'значение по умолчанию' - если параметр не передан
        const name = parsedUrl.query.name || 'без имени';
        const email = parsedUrl.query.email || 'не указан';
        const age = parsedUrl.query.age || 'не указан';
        const lang = parsedUrl.query.lang || 'ru';

        // ⚠️ ВАЛИДАЦИЯ ДАННЫХ - важная часть лабораторной!
        // Проверяем обязательные поля
        if (!name || name.trim() === '') {
            // Если имя пустое - возвращаем ошибку 400 (Bad Request)
            res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('Ошибка: Имя обязательно');
        }

        // 🎨 Формируем HTML-страницу с результатом
        // Это аналог JSP-страницы - динамическая генерация HTML
        const resultHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Результат обработки</title>
            <!-- Подключаем Bootstrap для красивого оформления -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <div class="card">
                    <!-- Шапка карточки с успешным статусом -->
                    <div class="card-header bg-success text-white">
                        <h4>✅ Данные обработаны!</h4>
                    </div>
                    <div class="card-body">
                        <!-- 📊 Выводим обработанные данные -->
                        <!-- ${variable} - подстановка переменных (аналог JSP Expression Language) -->
                        <p><strong>Имя:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Возраст:</strong> ${age}</p>
                        <!-- Показываем время обработки -->
                        <p><strong>Обработано:</strong> ${new Date().toLocaleString('ru-RU')}</p>
                        <!-- Кнопка возврата на главную -->
                        <a href="/" class="btn btn-primary">Назад к форме</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // 📤 Отправляем успешный ответ
        // 200 - OK, Content-Type - указываем что это HTML с UTF-8 кодировкой
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(resultHtml); // Отправляем сгенерированный HTML
        console.log('✅ Ответ отправлен');
        return; // Завершаем обработку этого запроса
    }

    // ❌ Если запрос не к /process - возвращаем 404 (Not Found)
    // Это базовая обработка ошибок
    res.writeHead(404);
    res.end('Not Found');
});

// 🚀 Запуск сервера
// Слушаем порт 3000 на всех сетевых интерфейсах (0.0.0.0)
server.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Сервер запущен на http://0.0.0.0:3000');
    console.log('📝 Доступные endpoints:');
    console.log('   GET /              - Главная страница с формой');
    console.log('   GET /process       - Обработка данных формы');
});