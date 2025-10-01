package com.leonid.controller;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/process")
public class FormServlet extends HttpServlet{
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse responce)
            throws ServletException, IOException{

                String name = request.getParameter("name");
                String email = request.getParameter("email");
                String message = request.getParameter("message");

                if (name == null || name.trim().isEmpty() ||
                    email == null || email.trim().isEmpty() ||
                    message == null || message.trim().isEmpty()){

                        request.setAttribute("error", "Все поля должны быть заполнены");
                        request.getRequestDispatcher("/error.jsp").forward(request, responce);
                        return;
                    }

                    request.setAttribute("name", name);
                    request.setAttribute("email", email);
                    request.setAttribute("message", message);

                    request.getRequestDispatcher("/result.jsp").forward(request, responce);
            }
}