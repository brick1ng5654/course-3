const API_BASE = '/api/v1';

async function createItem() {
    const name = document.getElementById('itemName').value.trim();
    const value = document.getElementById('itemValue').value;

    const messageElement = document.getElementById('message');
    messageElement.style.display = 'none';

    // Валидация
    if (!name) {
        showMessage('Пожалуйста, введите название элемента', 'error');
        return;
    }

    if (!value || isNaN(value)) {
        showMessage('Пожалуйста, введите корректное числовое значение', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, value: parseInt(value) })
        });

        if (!response.ok) {
            throw new Error('Ошибка при создании элемента');
        }

        const data = await response.json();

        // Показываем успешное сообщение
        showMessage('Элемент успешно создан!', 'success');

        // Отображаем результат
        document.getElementById('createOutput').textContent = JSON.stringify(data, null, 2);

        // Очищаем поля
        document.getElementById('itemName').value = '';
        document.getElementById('itemValue').value = '';

        // Обновляем список recent items
        loadRecentItems();

    } catch (error) {
        console.error('Error:', error);
        showMessage('Ошибка при создании элемента: ' + error.message, 'error');
        document.getElementById('createOutput').textContent = 'Ошибка: ' + error.message;
    }
}

function showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';

    // Автоматически скрываем сообщение через 5 секунд
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

async function loadRecentItems() {
    try {
        const response = await fetch(`${API_BASE}/items`);
        const items = await response.json();

        const recentItemsContainer = document.getElementById('recentItems');
        recentItemsContainer.innerHTML = '';

        // Показываем последние 5 элементов
        const recentItems = items.slice(-5).reverse();

        if (recentItems.length === 0) {
            recentItemsContainer.innerHTML = '<p>Нет созданных элементов</p>';
            return;
        }

        recentItems.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                        <h3>${item.name}</h3>
                        <p><strong>ID:</strong> ${item.id}</p>
                        <p><strong>Значение:</strong> ${item.value}</p>
                        <p><strong>Создан:</strong> ${new Date().toLocaleString()}</p>
                    `;
            recentItemsContainer.appendChild(itemCard);
        });

    } catch (error) {
        console.error('Error loading recent items:', error);
        document.getElementById('recentItems').innerHTML =
            '<p class="error">Ошибка загрузки элементов</p>';
    }
}


// Загружаем recent items при открытии страницы
document.addEventListener('DOMContentLoaded', loadRecentItems);