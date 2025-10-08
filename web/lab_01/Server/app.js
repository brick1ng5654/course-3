const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Данные пользователей
const users = {
    'admin': 'password123',
    'user': 'user123',
    'test': 'test123'
};

// Хранилище сессий (в реальном приложении - база данных)
const sessions = {};

// Функция проверки аутентификации
function checkAuth(authHeader) {
    if (!authHeader) return false;
    
    try {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');
        return users[username] && users[username] === password;
    } catch (error) {
        return false;
    }
}

// Функция для парсинга Cookie
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
        });
    }
    return cookies;
}

// Функция для установки Cookie 
function setCookie(res, name, value, options = {}) {
    let cookie = `${name}=${encodeURIComponent(value)}`; 
    
    if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options.path) cookie += `; Path=${options.path}`;
    if (options.httpOnly) cookie += `; HttpOnly`;
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
    
    // Получаем текущие Cookie и добавляем новый
    const currentCookies = res.getHeader('Set-Cookie') || [];
    if (typeof currentCookies === 'string') {
        res.setHeader('Set-Cookie', [currentCookies, cookie]);
    } else {
        res.setHeader('Set-Cookie', [...currentCookies, cookie]);
    }
}

// Функция для работы с сессиями
function handleSession(req, res) {
    const cookies = parseCookies(req.headers.cookie);
    let sessionId = cookies.sessionId;
    
    // Создаем новую сессию если нет
    if (!sessionId || !sessions[sessionId]) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        sessions[sessionId] = {
            visitCount: 0,
            lastVisit: null,
            createdAt: new Date(),
            sessionId: sessionId
        };
        setCookie(res, 'sessionId', sessionId, { 
            maxAge: 3600, 
            path: '/',
            httpOnly: true,
            sameSite: 'Lax'
        });
    }
    
    // Обновляем статистику посещений
    const session = sessions[sessionId];
    session.visitCount++;
    session.lastVisit = new Date().toLocaleString('ru-RU');
    
    return session;
}

const server = http.createServer((req, res) => {
    console.log('Получен запрос:', req.method, req.url);
    
    const parsedUrl = url.parse(req.url, true);
    
    // Обслуживание статических файлов
    if (parsedUrl.pathname.startsWith('/css/') || 
        parsedUrl.pathname.startsWith('/js/') || 
        parsedUrl.pathname.startsWith('/img/') ||
        parsedUrl.pathname.startsWith('/locales/')) {
        
        const filePath = path.join(__dirname, '../custom', parsedUrl.pathname);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                let contentType = 'text/html';
                if (parsedUrl.pathname.endsWith('.css')) contentType = 'text/css';
                if (parsedUrl.pathname.endsWith('.js')) contentType = 'application/javascript';
                if (parsedUrl.pathname.endsWith('.png')) contentType = 'image/png';
                if (parsedUrl.pathname.endsWith('.jpg')) contentType = 'image/jpeg';
                
                res.writeHead(200, {'Content-Type': contentType});
                res.end(data);
            }
        });
        return;
    }

    // Главная страница
    if (parsedUrl.pathname === '/' && req.method === 'GET') {
        // Обрабатываем сессию
        const session = handleSession(req, res);
        console.log('Главная страница. Сессия:', session.sessionId, 'Посещений:', session.visitCount);
        
        const filePath = path.join(__dirname, '../custom/index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(data);
            }
        });
        return;
    }

    // Страница просмотра Cookie
    
if (parsedUrl.pathname === '/cookies' && req.method === 'GET') {
    const session = handleSession(req, res);
    const cookies = parseCookies(req.headers.cookie);
    
    console.log('Страница Cookie. Все Cookie:', cookies);
    
    const cookiesHtml = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Просмотр Cookie</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            .cookie-item { border-left: 4px solid #28a745; padding-left: 15px; margin-bottom: 10px; }
            .session-item { border-left: 4px solid #007bff; padding-left: 15px; margin-bottom: 10px; }
        </style>
    </head>
    <body class="bg-light">
        <div class="container mt-5">
            <div class="card shadow-lg">
                <div class="card-header bg-info text-white">
                    <h4 class="mb-0">Просмотр всех Cookie и сессии</h4>
                </div>
                <div class="card-body">
                    
                    <!-- Cookie -->
                    <h5 class="mt-3">Cookie в браузере:</h5>
                    <div class="mb-4">
                        ${Object.entries(cookies).length > 0 ? 
                            Object.entries(cookies).map(([key, value]) => `
                                <div class="cookie-item">
                                    <strong>${key}:</strong> ${value}
                                </div>
                            `).join('') : 
                            '<p class="text-muted">Cookie не найдены</p>'
                        }
                    </div>

                    <!-- Сессия -->
                    <h5 class="mt-4">Данные сессии:</h5>
                    <div class="mb-4">
                        <div class="session-item">
                            <strong>ID сессии:</strong> ${session.sessionId}
                        </div>
                        <div class="session-item">
                            <strong>Количество посещений:</strong> ${session.visitCount}
                        </div>
                        <div class="session-item">
                            <strong>Последний визит:</strong> ${session.lastVisit}
                        </div>
                        <div class="session-item">
                            <strong>Сессия создана:</strong> ${session.createdAt.toLocaleString('ru-RU')}
                        </div>
                    </div>

                    <!-- Все Cookie в raw формате -->
                    <h5 class="mt-4"> Все Cookie (сырой вид):</h5>
                    <pre class="bg-dark text-light p-3 rounded">${req.headers.cookie || 'Cookie не найдены'}</pre>

                    <div class="mt-4">
                        <button onclick="refreshPage()" class="btn btn-primary"> Обновить</button>
                        <button onclick="clearAllCookies()" class="btn btn-danger"> Очистить все Cookie</button>
                        <a href="/" class="btn btn-success"> Заполнить форму</a>
                        <a href="/process?name=Test&email=test@test.com&age=25&color=text-danger&lang=ru" 
                           class="btn btn-warning"> Тест формы (с авторизацией)</a>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function refreshPage() {
                location.reload();
            }

            function clearAllCookies() {
                if (confirm('Вы уверены, что хотите очистить ВСЕ Cookie?')) {
                    document.cookie.split(";").forEach(cookie => {
                        const cookieName = cookie.split('=')[0].trim();
                        document.cookie = \`\${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;\`;
                    });
                    alert('Все Cookie очищены! Страница будет перезагружена.');
                    location.reload();
                }
            }

            // Логируем информацию
            console.log('🍪 Текущие Cookie:', document.cookie);
            console.log('📊 Статистика сессии:', ${JSON.stringify(session)});
            console.log('🔍 Все заголовки Cookie:', '${req.headers.cookie}');
        </script>
    </body>
    </html>
    `;

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(cookiesHtml);
    return;
}

    // Обработка формы (защищена аутентификацией)
    if (parsedUrl.pathname === '/process' && req.method === 'GET') {
        // ПРОВЕРКА АУТЕНТИФИКАЦИИ
        if (!checkAuth(req.headers.authorization)) {
            res.writeHead(401, {
                'Content-Type': 'text/html; charset=utf-8',
                'WWW-Authenticate': 'Basic realm="Secure Video Area"'
            });
            return res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Требуется авторизация</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body class="bg-light">
                    <div class="container mt-5">
                        <div class="card shadow-lg">
                            <div class="card-header bg-warning text-dark">
                                <h4 class="mb-0">Требуется авторизация</h4>
                            </div>
                            <div class="card-body text-center p-5">
                                <h5 class="text-muted mb-4">Доступ к видео-инструкции защищен</h5>
                                <div class="alert alert-info">
                                    <strong>Тестовые учетные данные:</strong><br>
                                    <strong>admin</strong> / password123 &nbsp;|&nbsp;
                                    <strong>user</strong> / user123 &nbsp;|&nbsp;
                                    <strong>test</strong> / test123
                                </div>
                                <a href="/" class="btn btn-primary">Вернуться на главную</a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        console.log('Обрабатываем форму с данными:', parsedUrl.query);
        
        const name = parsedUrl.query.name || 'без имени';
        const email = parsedUrl.query.email || 'не указан';
        const age = parsedUrl.query.age || 'не указан';
        const color = parsedUrl.query.color || 'text-primary';
        const lang = parsedUrl.query.lang || 'ru';

        // Валидация
        if (!name || name.trim() === '') {
            res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('Ошибка: Имя обязательно');
        }

        // Обрабатываем сессию
        const session = handleSession(req, res);
        
        // Устанавливаем пользовательские Cookie (ОБНОВЛЕННАЯ ВЕРСИЯ)
        setCookie(res, 'userName', name, { 
            maxAge: 86400, // 24 часа
            path: '/',
            sameSite: 'Lax'
        });
        setCookie(res, 'userEmail', email, { 
            maxAge: 86400,
            path: '/', 
            sameSite: 'Lax'
        });
        setCookie(res, 'userColor', color, { 
            maxAge: 86400,
            path: '/',
            sameSite: 'Lax'
        });
        setCookie(res, 'userAge', age, { 
            maxAge: 86400,
            path: '/',
            sameSite: 'Lax'
        });

        // Получаем все Cookie для отображения
        const cookies = parseCookies(req.headers.cookie);

        // Формируем результат с Cookie и сессией
        const resultHtml = `
        <!DOCTYPE html>
        <html lang="${lang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Профиль пользователя</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                .text-purple { color: #6f42c1 !important; }
                .cookie-card { border-left: 4px solid #28a745; }
                .session-card { border-left: 4px solid #007bff; }
                .user-card { border-left: 4px solid #6f42c1; }
            </style>
        </head>
        <body class="bg-light">
            <div class="container mt-4">
                <!-- Заголовок с выбранным цветом -->
                <div class="text-center mb-4 ${color}">
                    <h1 class="display-4 fw-bold">Ваш профиль</h1>
                    <p class="lead">Данные сохранены в Cookie и сессии</p>
                </div>

                <div class="row g-4">
                    <!-- Информация о пользователе -->
                    <div class="col-lg-6">
                        <div class="card shadow-sm user-card h-100">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Информация о пользователе</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Имя:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Возраст:</strong> ${age}</p>
                                <p><strong>Выбранный цвет:</strong> 
                                    <span class="${color} fw-bold">${color.replace('text-', '').toUpperCase()}</span>
                                </p>
                                <p><strong>Время обработки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Данные из Cookie -->
                    <div class="col-lg-6">
                        <div class="card shadow-sm cookie-card h-100">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Данные из Cookie</h5>
                            </div>
                            <div class="card-body">
                                ${Object.entries(cookies).map(([key, value]) => `
                                    <p><strong>${key}:</strong> ${value}</p>
                                `).join('')}
                                <div class="alert alert-info mt-3">
                                    <small>Эти данные хранятся в вашем браузере и отправляются при каждом запросе</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Статистика сессии -->
                    <div class="col-12">
                        <div class="card shadow-sm session-card">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Статистика сессии</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4">
                                        <p><strong>ID сессии:</strong><br>
                                        <small class="text-muted">${session.sessionId}</small></p>
                                    </div>
                                    <div class="col-md-4">
                                        <p><strong>Количество посещений:</strong><br>
                                        <span class="fs-4 ${color}">${session.visitCount}</span></p>
                                    </div>
                                    <div class="col-md-4">
                                        <p><strong>Последний визит:</strong><br>
                                        ${session.lastVisit}</p>
                                    </div>
                                </div>
                                <div class="alert alert-warning mt-3">
                                    <small>Сессия хранится на сервере и обновляется при каждом посещении</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Кнопки управления -->
                    <div class="col-12 text-center">
                        <div class="d-grid gap-2 d-md-block">
                            <a href="/" class="btn btn-primary btn-lg px-4">Заполнить форму снова</a>
                            <a href="/cookies" class="btn btn-info btn-lg px-4">Посмотреть все Cookie</a>
                            <button onclick="clearCookies()" class="btn btn-outline-danger btn-lg px-4">Очистить Cookie</button>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                function clearCookies() {
                    if (confirm('Вы уверены, что хотите очистить все Cookie?')) {
                        document.cookie.split(";").forEach(function(c) {
                            const cookie = c.trim();
                            const eqPos = cookie.indexOf("=");
                            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        });
                        alert('Cookie очищены! Страница будет перезагружена.');
                        location.reload();
                    }
                }

                // Показываем информацию о Cookie
                console.log('Текущие Cookie:', document.cookie);
                console.log('Статистика сессии:', {
                    visitCount: ${session.visitCount},
                    lastVisit: '${session.lastVisit}',
                    sessionId: '${session.sessionId}'
                });
            </script>
        </body>
        </html>
        `;

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(resultHtml);
        console.log('Ответ отправлен (аутентифицированный пользователь)');
        console.log('Установлены Cookie для пользователя:', name);
        console.log('Статистика сессии:', session);
        return;
    }

    // Для всех остальных запросов - 404
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Сервер запущен на http://0.0.0.0:3000');
    console.log('Защищенные endpoints (требуют авторизации):');
    console.log('   GET /process');
    console.log('Доступные страницы:');
    console.log('   GET /              - Главная страница с формой');
    console.log('   GET /cookies       - Просмотр всех Cookie');
    console.log('Функции: Cookie, сессии, аутентификация');
    console.log('Сессии в памяти:', Object.keys(sessions).length);
});