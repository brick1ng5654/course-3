const express = require('express');
const path = require('path');
const i18next = require('i18next');
const basicAuth = require('basic-auth');
const https = require('https');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const HTTPS_PORT = 3443

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        fallbackLng: 'ru',
        preload: ['ru', 'en'],
        ns: ['messages'],
        defaultNS: 'messages',
        backend: {
            loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json')
        },
        detection: {
            order: ['querystring', 'cookie'],
            caches: ['cookie']
        }
    });

/**
 * Экземпляр Express приложения
 * 
 * @type {express.Application}
 */
const app = express()

/**
 * Порт сервера
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

/**
 * Префикс API
 * @type {string}
 */
const API_PREFIX = process.env.API_PREFIX || '${API_PREFIX}';

app.set('view engine');

app.use(express.urlencoded({ extended: true }));

app.use(i18nextMiddleware.handle(i18next));
//Serve static files
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: 'lab7-secret-'+Date.now(),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) => {
    if (!req.session.visitCount){
        req.session.visitCount = 0;
    }
    req.session.visitCount ++;
    req.session.lastVisit = new Date().toLocaleString('ru-RU');
    next();
});

//Аутентификация
const auth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next();
    }

    if (req.path === '/login' || req.path === '/auth'){
        return next();
    }

    res.redirect('/login');
}

app.get('/login', (req,res) => {
    if (req.session.authenticated) {
        return res.redirect('/');
    }

    res.sendFile(path.join(__dirname, '/public/views/login.html'));
});

app.post('/auth', express.urlencoded({ extended: true}), (req, res) => {
    const {username, password} = req.body;

    console.log('Auth attempt: ', {username, password});

    if (username === 'admin' && password === 'password123'){
        req.session.authenticated = true;
        req.session.username = username;
        console.log('Auth successful');
        res.redirect('/');
    }else{
        console.log('Auth failed');
        res.redirect('/login?error=Invalid credentials');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session: ', err);
        }
        res.redirect('/login');
    });
});

app.use(auth);

app.post('/save-preferences', auth, (req, res) => {
    const { userName, bgColor } = req.body;

    console.log('Saving preferences:', { userName, bgColor });

    // Сохраняем в Cookie
    res.cookie('userName', userName, { 
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 дней
        httpOnly: false
    });
    res.cookie('bgColor', bgColor, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false
    });
    res.cookie('visitCount', req.session.visitCount, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false
    });
    res.cookie('lastVisit', req.session.lastVisit, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false
    });

    res.redirect('/profile');
});

app.get('/clear-cookies', auth, (req, res) => {
    res.clearCookie('userName');
    res.clearCookie('bgColor');
    res.redirect('/preferences');
});

app.get('/change-language/:lng', auth, (req, res) => {
    res.json([
        { id: 1, name: req.t('itemExample', { number: 1}), value: 100},
        { id: 2, name: req.t('itemExample', {number: 2}), value: 200}
    ])
})
/**
 * Хранилище данных в памяти
 * @type {Array<Object>}
 * @property {number} id - ID элемента
 * @property {string} name - Название элемента
 * @property {number} value - Значение элемента
 */
let items = [
    { id: 1, name: 'Пример элемента 1', value: 100},
    { id: 2, name: 'Пример элемента 2', value: 200}
]

app.get('/css', auth, express.static(path.join(__dirname, '/public/css')))

//Главная страница
app.get('/', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/index.html'));
});

//GWT приложение
app.get('/gwt-app', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/gwt-app.html'));
});

//Страница со всеми элементавми
app.get('/view-all', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/view-all.html'));
});

//Страница с конкретным элементом
app.get('/view-item', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/view-item.html'));
});

//Страница создания элемента
app.get('/create-item', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/create-item.html'));
});

//Страница системной информации
app.get('/system-info', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/system-info.html'));
});

//Страница preferences
app.get('/preferences', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/preferences.html'));
});
//Страница profile
app.get('/profile', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/profile.html'));
});
app.get('/form', auth, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/form.html'));
});

/**
 * GET api/v1/items - Получить все эелементы
 * @param {express.Request} req - Объект запроса
 * @param {express.Response} res - Объект ответа
 * @returns {Array<Object>} Массив элементов
 */
app.get(`${API_PREFIX}/items`, auth, (req, res) => {
    const minValue = parseInt(req.query.minValue);

    let result = items;
    if (!isNaN(minValue)){
        result = items.filter(item => item.value >= minValue);
    }

    res.json(result);
});

/**
 * GET ${API_PREFIX}/items/:id - Получить элемент по id
 * @param {express.Request} req - Объект запроса
 * @param {express.Response} res - Объект ответа
 * @returns {Object} Элемент с указанным ID
 * @throws {404} Если элемент не найден
 */
app.get(`${API_PREFIX}/items/:id`, auth, (req, res) => {
        const id = parseInt(req.params.id);
        
        console.log(`Поиск элемента с id: ${id}, тип: ${typeof id}`);
        console.log(`Все элементы: ${JSON.stringify(items)}`);
        const item = items.find(i => i.id === id);

        if (!item){
            console.log(`Элемент с id ${id} не найден`)
            return res.status(404).json({ error: 'Элемент не найден'});
        }

        res.json(item);
});

//Удаление элемента
app.delete(`${API_PREFIX}/items/:id`, auth, (req, res) => {
    const id = parseInt(req.params.id);
    const itemIndex = items.findIndex(item => item.id === id);

    if (itemIndex === -1){
        return res.status(404).json({ error: 'Элемент не найден' });
    }

    const deletedItem = items.splice(itemIndex, 1)[0];
    res.json({ message: 'Элемент удален', item: deletedItem});
})

app.get(`${API_PREFIX}/stats`, auth, (req, res) => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    const avgValue = totalItems > 0 ? totalValue / totalItems : 0;

    res.json({
        totalItems,
        totalValue,
        avgValue: Math.round(avgValue * 100) / 100,
        itemsByValue: items.map(item => ({
            name: item.name,
            value: item.value
        }))
    });
});
/**
 * POST /api/v1/items - Создать новый элемент
 * @param {express.Request} req - Объекта запроса
 * @param {express.Response} res - Объект ответа
 * @returns {Object} Созданный элемент
 * @throws {404} Если не указаны name или value
 */
app.post(`${API_PREFIX}/items`, auth, (req, res) => {
    const { name, value } = req.body;   // Параметры из тела запроса

    if (!name || value === undefined){
        return res.status(404).json({error: 'Необходимо указать name и value'});
    }

    const newItem = {
        id: Math.max(...items.map(i => i.id)) + 1,
        name,
        value: parseInt(value)
    };

    items.push(newItem);
    res.status(201).json(newItem);

})


/**
 * GET api/v1/data - ПОлучить системную информацию
 * @param {express.Request} req - Объект запроса
 * @param {express.Response} res - ОБъект ответа
 * @returns {Object} Системная информация
 */
app.get(`${API_PREFIX}/data`, auth, (req, res) => {
    res.json({
        message: 'Hello from  Node.js!',
        timestamp: new Date().toISOString()
    });
});

app.post('/process-form', auth, (req, res) => {
    const { name, email, message } = req.body;

    // Валидация
    if (!name || !email || !message) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Ошибка</title>
                <link rel="stylesheet" href="/css/style.css">
                <style>
                    .error-container {
                        max-width: 500px;
                        margin: 50px auto;
                        padding: 30px;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        text-align: center;
                    }
                    .error-message {
                        color: #e74c3c;
                        font-size: 1.2em;
                        margin: 20px 0;
                        padding: 15px;
                        background: #ffeaa7;
                        border-radius: 5px;
                    }
                    .back-button {
                        display: inline-block;
                        padding: 10px 20px;
                        background: #3498db;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error-container">
                        <h1>⚠️ Ошибка</h1>
                        <div class="error-message">
                            Все поля должны быть заполнены
                        </div>
                        <a href="/form" class="back-button">← Вернуться к форме</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    // Обработка данных
    const processData = {
        name: name.toUpperCase(),
        email: email.toLowerCase(),
        message: message,
        timestamp: new Date(),
        id: Math.random().toString(36).substr(2, 9)
    };

    // Отправляем красивый HTML результат
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Результат обработки</title>
            <link rel="stylesheet" href="/css/style.css">
            <style>
                .result-container {
                    max-width: 600px;
                    margin: 50px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .success-message {
                    color: #27ae60;
                    font-size: 1.5em;
                    margin-bottom: 20px;
                }
                .result-item {
                    margin: 15px 0;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
                .back-button {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-right: 10px;
                }
                .nav-buttons {
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="nav-buttons">
                    <a href="/" class="back-button">Главная</a>
                    <a href="/form" class="back-button" style="background: #27ae60;">Новая форма</a>
                </div>
                
                <div class="result-container">
                    <div class="success-message">✅ Данные успешно обработаны!</div>
                    
                    <h2>Введенные данные:</h2>
                    
                    <div class="result-item">
                        <strong>Имя:</strong> ${processData.name}
                    </div>
                    
                    <div class="result-item">
                        <strong>Email:</strong> ${processData.email}
                    </div>
                    
                    <div class="result-item">
                        <strong>Сообщение:</strong> ${processData.message}
                    </div>
                    
                    <div class="result-item">
                        <strong>ID обработки:</strong> ${processData.id}
                    </div>
                    
                    <div class="result-item">
                        <strong>Время обработки:</strong> ${processData.timestamp}
                    </div>

                    <div style="margin-top: 30px;">
                        <a href="/form" class="back-button">← Заполнить новую форму</a>
                        <a href="/" class="back-button" style="background: #95a5a6;">На главную</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});
/**
 * Запуск серовера
 */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API prefix: ${API_PREFIX}`);
    console.log(`Items API: http://localhost:${PORT}${API_PREFIX}/items`);
}); 

try{
    const options = {
        key: fs.readFileSync('ssl/key.pem'),
        cert: fs.readFileSync('ssl/cert.pem')
    };

    https.createServer(options, app).listen(HTTPS_PORT, () => {
        console.log(`Https Server: https://localhost/${HTTPS_PORT}`);
    });
}catch (error) {
    console.log('Https не настроен')
}