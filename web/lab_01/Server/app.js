const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Обслуживание статических файлов (локализации)
    if (parsedUrl.pathname.startsWith('/locales/')) {
        const filePath = path.join(__dirname, '../client', parsedUrl.pathname);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                res.end(data);
            }
        });
        return;
    }
    
    // Обработка формы
    if (parsedUrl.pathname === '/process' && req.method === 'GET') {
        const name = parsedUrl.query.name || 'без имени';
        const lang = parsedUrl.query.lang || 'ru'; // Получаем язык из запроса
        
        fs.readFile('result.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Ошибка');
            }
            
            // Заменяем плейсхолдеры с учетом языка
            let html = data.replace('{{name}}', name);
            html = html.replace('{{lang}}', lang); // Передаем язык в результат
            
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(html);
        });
    } else {
        // Отдаем главную страницу
        const filePath = path.join(__dirname, '../client/index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(data);
            }
        });
    }
});
// Запуск сервера на порту 3000
server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});