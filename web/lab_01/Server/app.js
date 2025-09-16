const http = require('http'); // Модуль для создания HTTP-сервера
const url = require('url'); // Модуль для парсинга URL
const fs = require('fs'); // Модуль для работы с файловой системой

// Создание HTTP-сервера с обработчиком запросов
const server = http.createServer((req, res) => {
    // Парсинг URL запроса с получением query-параметров
    const parsedUrl = url.parse(req.url, true);
    
    // Проверка: если запрос идет на /process методом GET
    if (parsedUrl.pathname === '/process' && req.method === 'GET') {
        // Извлечение параметра 'name' из query-строки или значение по умолчанию
        const name = parsedUrl.query.name || 'без имени';
        
        // Асинхронное чтение HTML-шаблона result.html
        fs.readFile('result.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Ошибка');
            }
            
            // Замена плейсхолдера {{name}} на реальное имя из запроса
            const html = data.replace('{{name}}', name);
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(html);
        });
    } else {
        // Для всех других маршрутов - возвращаем 404 ошибку
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Запуск сервера на порту 3000
server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});