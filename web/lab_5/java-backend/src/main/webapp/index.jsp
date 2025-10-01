<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Java JSP приложение</title>
    <style>
        .nav-buttons {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 5px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 3px;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            opacity: 0.9;
        }
        .btn-node {
            background: #6f42c1;
        }
        .btn-java {
            background: #28a745;
        }
    </style>
</head>
<body>
    <div class="nav-buttons">
        <a href="/" class="btn btn-node">← Node.js приложение</a>
        <a href="/java/" class="btn btn-java">Java JSP приложение</a>
    </div>

    <h1>Java JSP приложение</h1>
    <p>Эта часть реализована на Java с использованием JSP страниц и сервлетов.</p>
    
    <nav>
        <a href="form.jsp" class="btn">Форма отправки данных</a>
        <a href="result.jsp" class="btn">Результаты</a>
    </nav>

    <div style="margin-top: 20px;">
        <h2>Лабораторная работа №5</h2>
        <p>JSP-страница с формой, отправляющей данные на сервер, и отображением результата обработки.</p>
        <p>Обработка осуществляется на языке Java с выводом информации об ошибочных ситуациях через JSP-страницы.</p>
    </div>
</body>
</html>