<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Форма отправки данных</title>
    <style>
        /* Добавим стили из result.jsp для консистентности */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .nav-buttons {
            background: #2c3e50;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn {
            display: inline-block;
            padding: 12px 25px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .btn-node {
            background: #9b59b6;
        }
        .btn-java {
            background: #27ae60;
        }
        .content {
            padding: 40px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
        }
        input, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #bdc3c7;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #3498db;
        }
        .submit-btn {
            background: #27ae60;
            color: white;
            padding: 15px 30px;
            font-size: 18px;
            width: 100%;
        }
        .submit-btn:hover {
            background: #219a52;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav-buttons">
            <a href="/" class="btn btn-node">← Node.js приложение</a>
            <a href="/java/" class="btn btn-java">Главная Java</a>
        </div>

        <div class="content">
            <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">📝 Форма отправки данных</h1>
            
            <form action="process" method="post">
                <div class="form-group">
                    <label for="name">👤 Имя:</label>
                    <input type="text" id="name" name="name" required placeholder="Введите ваше имя">
                </div>

                <div class="form-group">
                    <label for="email">📧 Email:</label>
                    <input type="email" id="email" name="email" required placeholder="Введите ваш email">
                </div>

                <div class="form-group">
                    <label for="message">💬 Сообщение:</label>
                    <textarea id="message" name="message" rows="5" required placeholder="Введите ваше сообщение"></textarea>
                </div>

                <button type="submit" class="btn submit-btn">🚀 Отправить данные</button>
            </form>
        </div>
    </div>
</body>
</html>