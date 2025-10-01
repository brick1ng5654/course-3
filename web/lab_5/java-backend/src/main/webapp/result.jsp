<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.Date" %>
<html>
<head>
    <title>Результат обработки</title>
    <style>
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
            text-align: center;
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
        .btn-back {
            background: #e74c3c;
        }
        .content {
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.1em;
        }
        .result-card {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 5px solid #27ae60;
        }
        .result-item {
            margin-bottom: 15px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .result-label {
            font-weight: 600;
            color: #2c3e50;
            display: block;
            margin-bottom: 5px;
        }
        .result-value {
            color: #34495e;
            font-size: 1.1em;
            padding: 8px 12px;
            background: #ecf0f1;
            border-radius: 5px;
            border-left: 3px solid #3498db;
        }
        .success-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #27ae60;
            color: white;
            border-radius: 20px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            margin-top: 20px;
        }
        .actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        @media (max-width: 600px) {
            .nav-buttons {
                flex-direction: column;
                gap: 10px;
            }
            .content {
                padding: 20px;
            }
            .actions {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Навигация -->
        <div class="nav-buttons">
            <a href="/" class="btn btn-node">← Node.js приложение</a>
            <div>
                <a href="/java/" class="btn btn-java">Главная Java</a>
                <a href="form.jsp" class="btn">Новая форма</a>
            </div>
        </div>

        <!-- Основной контент -->
        <div class="content">
            <div class="header">
                <h1>✅ Данные успешно обработаны!</h1>
                <p class="subtitle">Результат обработки вашей формы</p>
            </div>

            <div class="success-badge">
                Успешно! Спасибо за ваши данные
            </div>

            <div class="result-card">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">📋 Введенные данные:</h2>
                
                <div class="result-item">
                    <span class="result-label">👤 Имя:</span>
                    <div class="result-value">${name}</div>
                </div>

                <div class="result-item">
                    <span class="result-label">📧 Email:</span>
                    <div class="result-value">${email}</div>
                </div>

                <div class="result-item">
                    <span class="result-label">💬 Сообщение:</span>
                    <div class="result-value">${message}</div>
                </div>

                <div class="result-item">
                    <span class="result-label">🆔 ID сессии:</span>
                    <div class="result-value"><%= session.getId() %></div>
                </div>
            </div>

            <!-- Дополнительная информация -->
            <div class="result-card" style="border-left-color: #3498db;">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">📊 Дополнительная информация:</h2>
                
                <div class="result-item">
                    <span class="result-label">🕒 Время обработки:</span>
                    <div class="result-value"><%= new Date() %></div>
                </div>

                <div class="result-item">
                    <span class="result-label">🌐 IP адрес:</span>
                    <div class="result-value"><%= request.getRemoteAddr() %></div>
                </div>

                <div class="result-item">
                    <span class="result-label">🔧 Сервер:</span>
                    <div class="result-value">Apache Tomcat 9.0</div>
                </div>
            </div>

            <!-- Кнопки действий -->
            <div class="actions">
                <a href="form.jsp" class="btn" style="background: #3498db;">📝 Заполнить новую форму</a>
                <a href="/java/" class="btn" style="background: #2c3e50;">🏠 На главную Java</a>
                <a href="/" class="btn" style="background: #9b59b6;">🌐 Перейти в Node.js часть</a>
            </div>

            <div class="timestamp">
                Страница сгенерирована: <%= new Date() %>
            </div>
        </div>
    </div>
</body>
</html>