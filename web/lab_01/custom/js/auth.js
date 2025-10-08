// 🔐 Функции авторизации - ОБЪЯВЛЯЕМ ГЛОБАЛЬНО
window.showAuthModal = function() {
    console.log('🔄 showAuthModal вызвана');
    
    // Проверяем элементы
    const modalElement = document.getElementById('authModal');
    const authButton = document.getElementById('authButton');
    
    console.log('modalElement:', !!modalElement);
    console.log('authButton:', !!authButton);
    
    if (!modalElement) {
        console.error('❌ Модальное окно не найдено!');
        alert('Ошибка: модальное окно не найдено');
        return;
    }
    
    // Проверяем загружен ли Bootstrap
    if (typeof bootstrap === 'undefined') {
        console.error('❌ Bootstrap не загружен!');
        alert('Ошибка: Bootstrap не загружен');
        return;
    }
    
    try {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log('✅ Модальное окно открыто');
    } catch (error) {
        console.error('❌ Ошибка открытия модального окна:', error);
        alert('Ошибка открытия окна: ' + error.message);
    }
};

window.performAuth = function() {
    console.log('🔄 performAuth вызвана');
    const login = document.getElementById('authLogin').value;
    const password = document.getElementById('authPassword').value;
    
    console.log('Введенные данные:', { login, password });
    
    if (!login || !password) {
        alert('Введите логин и пароль');
        return;
    }
    
    // Простая проверка
    const validUsers = {
        'admin': 'password123',
        'user': 'user123', 
        'test': 'test123'
    };
    
    if (validUsers[login] && validUsers[login] === password) {
        console.log('✅ Авторизация успешна для пользователя:', login);
        window.authCredentials = btoa(login + ':' + password);
        window.isAuthenticated = true;
        
        // Активируем кнопку отправки
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-secondary');
            submitBtn.classList.add('btn-success');
            submitBtn.textContent = 'получить инструкцию';
        }
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        if (modal) {
            modal.hide();
        }
        
        alert('✅ Авторизация успешна! Теперь вы можете отправить форму.');
    } else {
        console.log('❌ Неверные данные авторизации');
        alert('❌ Неверный логин или пароль');
    }
};

// 🔐 Перехватываем отправку формы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM загружен, настраиваю обработчики');
    
    // Назначаем обработчик кнопке авторизации
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', showAuthModal);
        console.log('✅ Обработчик кнопки авторизации настроен');
    } else {
        console.error('❌ Кнопка authButton не найдена!');
    }
    
    const authForm = document.getElementById('authForm');
    if (!authForm) {
        console.error('❌ Форма authForm не найдена!');
        return;
    }
    
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🔄 Форма отправлена, isAuthenticated:', window.isAuthenticated);
        
        if (!window.isAuthenticated) {
            alert('Сначала авторизуйтесь!');
            showAuthModal();
            return;
        }
        
        // Собираем данные формы
        const formData = new FormData(this);
        const params = new URLSearchParams(formData);
        
        console.log('📤 Отправка запроса на /process');
        
        // Отправляем запрос с авторизацией
        fetch('https://localhost/process?' + params.toString(), {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + window.authCredentials
            }
        })
        .then(response => {
            console.log('📥 Получен ответ:', response.status);
            if (response.status === 401) {
                alert('Ошибка авторизации. Попробуйте снова.');
                window.isAuthenticated = false;
                document.getElementById('submitBtn').disabled = true;
                showAuthModal();
                return;
            }
            return response.text();
        })
        .then(html => {
            console.log('✅ HTML получен, открываю в новом окне');
            // Открываем результат в новом окне
            const newWindow = window.open();
            newWindow.document.write(html);
            newWindow.document.close();
        })
        .catch(error => {
            console.error('❌ Ошибка:', error);
            alert('Произошла ошибка при отправке формы');
        });
    });
    
    console.log('✅ Все обработчики настроены');
});