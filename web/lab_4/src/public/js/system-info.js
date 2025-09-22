const API_BASE = '/api/v1';

async function loadSystemInfo() {
    try {
        // Показываем загрузку
        document.getElementById('serverTime').innerHTML = '<span class="loading"></span>';
        document.getElementById('totalItems').innerHTML = '<span class="loading"></span>';
        document.getElementById('apiStatus').innerHTML = '<span class="loading"></span>';

        // Загружаем системную информацию
        const response = await fetch(`${API_BASE}/data`);
        const data = await response.json();

        // Обновляем системные карточки
        document.getElementById('serverTime').textContent = new Date(data.timestamp).toLocaleTimeString();
        document.getElementById('apiStatus').textContent = '✅ Работает';
        document.getElementById('apiStatus').style.color = '#27ae60';

        // Загружаем количество элементов
        const itemsResponse = await fetch(`${API_BASE}/items`);
        const items = await itemsResponse.json();

        document.getElementById('totalItems').textContent = items.length;

        // Обновляем детальную информацию
        document.getElementById('systemOutput').textContent = JSON.stringify(data, null, 2);

        // Обновляем статистику
        updateStatistics(items);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('apiStatus').textContent = '❌ Ошибка';
        document.getElementById('apiStatus').style.color = '#e74c3c';
        document.getElementById('systemOutput').textContent = 'Ошибка загрузки системной информации: ' + error.message;
    }
}

function updateStatistics(items) {
    if (items.length === 0) {
        document.getElementById('activeItems').textContent = '0';
        document.getElementById('maxValue').textContent = '0';
        document.getElementById('avgValue').textContent = '0';
        return;
    }

    // Вычисляем статистику
    const maxValue = Math.max(...items.map(item => item.value));
    const avgValue = items.reduce((sum, item) => sum + item.value, 0) / items.length;

    document.getElementById('activeItems').textContent = items.length;
    document.getElementById('maxValue').textContent = maxValue;
    document.getElementById('avgValue').textContent = avgValue.toFixed(2);
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
}

function showBasicInfo() {
    loadSystemInfo();
}

function showConfigInfo() {
    fetch(`${API_BASE}/data`)
        .then(response => response.json())
        .then(data => {
            const configInfo = {
                config: data.config,
                serverTime: data.timestamp,
                apiVersion: 'v1'
            };
            document.getElementById('systemOutput').textContent = JSON.stringify(configInfo, null, 2);
        })
        .catch(error => {
            document.getElementById('systemOutput').textContent = 'Ошибка: ' + error.message;
        });
}

function showPerformanceInfo() {
    const perfInfo = {
        performance: {
            memoryUsage: process.memoryUsage ? process.memoryUsage() : 'N/A',
            uptime: process.uptime ? process.uptime() + ' seconds' : 'N/A',
            platform: navigator.platform,
            userAgent: navigator.userAgent
        }
    };
    document.getElementById('systemOutput').textContent = JSON.stringify(perfInfo, null, 2);
}

// Автоматически загружаем информацию при открытии страницы
document.addEventListener('DOMContentLoaded', loadSystemInfo);

// Обновляем время каждую секунду
setInterval(() => {
    const timeElement = document.getElementById('serverTime');
    if (timeElement && timeElement.textContent !== 'Загрузка...') {
        timeElement.textContent = new Date().toLocaleTimeString();
    }
}, 1000);