document.addEventListener('DOMContentLoaded', function(){
    console.log('Страница загружена!');

    const button = document.getElementById('myButton');

    button.addEventListener('click', function(){
        alert('Hello from JS');
        console.log('Кнопка была нажата');
    });
});