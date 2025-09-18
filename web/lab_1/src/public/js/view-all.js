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
