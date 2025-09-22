const API_BASE = '/api/v1';

async function loadItem() {
    const itemId = document.getElementById('itemId').value;
    try {
        const response = await fetch(`${API_BASE}/items/${itemId}`);
        if (!response.ok) {
            throw new Error('Элемент не найден');
        }
        const data = await response.json();
        document.getElementById('itemOutput').textContent = JSON.stringify(data, null, 2);
        
        // Обновляем URL с параметром
        window.history.pushState({}, '', `/view-item?id=${itemId}`);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('itemOutput').textContent = 'Ошибка: ' + error.message;
    }
}