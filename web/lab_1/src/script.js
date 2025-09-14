const API_PREFIX = '/api/v1';

async function loadItems(){
    try{
        const responce = await fetch('/api/v1/items');
        const data = await responce.json();
        document.getElementById('itemsOutput').textContent = JSON.stringify(data, null, 2);
    } catch (error){
        console.error('Error: ', error);
    }
}

async function loadFilteredItems(){
    try{
        const responce = await fetch('/api/v1/items?minValue=150');
        const data = await responce.json();
        document.getElementById('itemsOutput').textContent = JSON.stringify(data, null, 2);
    } catch (error){
        console.error("Error: ", error);
    }
}

async function loadItem(){
    const itemId = document.getElementById('itemId').value;
    try{
        const responce = await fetch(`/api/v1/items/${itemId}`);
        const data = await responce.json();
        document.getElementById('itemOutput').textContent = JSON.stringify(data, null, 2);
    } catch (error){
        console.error("Error: ", error);
    }
}

async function createItem(){
    const name = document.getElementById('itemName').value;
    const value = document.getElementById('itemValue').value;

    try{
        const responce = await fetch('/api/v1/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, value })
        });
        const data = await responce.json();
        document.getElementById('createOutput').textContent = JSON.stringify(data, null, 2);

        // Отчищаем поля после успешного создания
        document.getElementById('itemName').value = '';
        document.getElementById('itemValue').value = '';
    } catch (error){
        console.error("Error: ", error);
    }
}

async function loadSystemInfo(){
    try{
        const responce = await fetch('/api/v1/data');
        const data = await responce.json();
        document.getElementById('systemOutput').textContent = JSON.stringify(data, null, 2);
    } catch (error){
        console.error("Error: ", error);
    }
}
// document.addEventListener('DOMContentLoaded', function(){
//     console.log('Страница загружена!');

//     const button = document.getElementById('myButton');

//     button.addEventListener('click', function(){
//         alert('Hello from JS');
//         console.log('Кнопка была нажата');
//     });
// });