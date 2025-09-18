const express = require('express');
const path = require('path');
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

//Serve static files
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());

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

app.get('/css', express.static(path.join(__dirname, '/public/css')))
//Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/index.html'));
});

//Страница со всеми элементавми
app.get('/view-all', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/view-all.html'));
});

//Страница с конкретным элементом
app.get('/view-item', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/view-item.html'));
});

//Страница создания элемента
app.get('/create-item', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/create-item.html'));
});

//Страница системной информации
app.get('/system-info', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/system-info.html'));
});


/**
 * GET api/v1/items - Получить все эелементы
 * @param {express.Request} req - Объект запроса
 * @param {express.Response} res - Объект ответа
 * @returns {Array<Object>} Массив элементов
 */
app.get(`${API_PREFIX}/items`, (req, res) => {
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
app.get(`${API_PREFIX}/items/:id`, (req, res) => {
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

/**
 * POST /api/v1/items - Создать новый элемент
 * @param {express.Request} req - Объекта запроса
 * @param {express.Response} res - Объект ответа
 * @returns {Object} Созданный элемент
 * @throws {404} Если не указаны name или value
 */
app.post(`${API_PREFIX}/items`, (req, res) => {
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
app.get(`${API_PREFIX}/data`, (req, res) => {
    res.json({
        message: 'Hello from  Node.js!',
        timestamp: new Date().toISOString()
    });
});

/**
 * Запуск серовера
 */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API prefix: ${API_PREFIX}`);
    console.log(`Items API: http://localhost:${PORT}${API_PREFIX}/items`);
}); 