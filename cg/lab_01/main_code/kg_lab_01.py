import tkinter as tk
import math

class RotationApp:
    # инициализируем окно
    # cохраняем ссылку на главное окно (root) и задаём ему заголовок
    def __init__(self, root):
        self.root = root
        self.root.title("Поворот объекта вокруг произвольной точки")
        self.canvas_width = 600
        self.canvas_height = 400

        # Создаем Canvas и область для отрисовки
        self.canvas = tk.Canvas(root, width=self.canvas_width, height=self.canvas_height, bg="white")
        self.canvas.pack()

        # Параметры объекта (например, треугольник)
        self.original_points = [(100, 100), (150, 50), (200, 100)]  # Исходные координаты треугольник
        self.rotated_points = self.original_points.copy() # копия точек, здесь будут записываться измененые координаты

        # Точка вокруг которой происходит вращения 
        self.rotation_point = [300, 200]  # [x, y]

        # Угол поворота в градусах
        self.angle_deg = 0

        # Созадем рамку frame для размещения элементов программы
        control_frame = tk.Frame(root)
        control_frame.pack(pady=10)

        # Слайдер для поворота фигуры в градусах вокруг заданной точки
        # При любом движении слайдера вызывается метод update_rotation
        tk.Label(control_frame, text="Угол поворота фигуры:").grid(row=0, column=0, padx=5)
        self.angle_slider = tk.Scale(control_frame, from_=0, to=360, orient=tk.HORIZONTAL, length=300,
                                     command=self.update_rotation)
        self.angle_slider.set(self.angle_deg)
        self.angle_slider.grid(row=0, column=1, padx=5)

        # Поле ввода для X-координаты точки вращения.
        # Заполняем его начальным значением 300
        tk.Label(control_frame, text="Точка вращения X:").grid(row=1, column=0, padx=5)
        self.point_x_entry = tk.Entry(control_frame, width=10)
        self.point_x_entry.insert(0, str(self.rotation_point[0]))
        self.point_x_entry.grid(row=1, column=1, sticky="w", padx=5)
        # Поле ввода для Y-координаты.
        # Расположено справа в той же ячейке (с помощью sticky="e" — прижато к правому краю)
        tk.Label(control_frame, text="Y:").grid(row=1, column=1)
        self.point_y_entry = tk.Entry(control_frame, width=10)
        self.point_y_entry.insert(0, str(self.rotation_point[1]))
        self.point_y_entry.grid(row=1, column=1, sticky="e", padx=5)

        # Кнопка, которая считывает значения из полей ввода и обновляет точку вращения
        tk.Button(control_frame, text="Обновить точку", command=self.update_point_from_entry).grid(row=1, column=2, padx=10)

        # Подсказка
        tk.Label(root, text="Кликните на холсте, чтобы задать новую точку вращения").pack()

        # Привязка клика мыши
        self.canvas.bind("<Button-1>", self.set_rotation_point_by_click)

        # Рисуем первый кадр
        self.draw_all()
    
    # Поворачивает точку (x,y) вокруг center=(cx,cy) на угол angle_rad
    # Сдвигаем систему координат так, чтобы центр вращения стал началом (вычитаем cx, cy)
    # Применяем стандартную матрицу поворота:
    def rotate_point(self, point, center, angle_rad):
        x, y = point
        cx, cy = center
        # Перенос в начало координат
        x -= cx
        y -= cy
        # Поворот
        x_new = x * math.cos(angle_rad) - y * math.sin(angle_rad)
        y_new = x * math.sin(angle_rad) + y * math.cos(angle_rad)
        # Обратный перенос
        x_new += cx
        y_new += cy
        return x_new, y_new
    
    # Обновляет повёрнутые координаты объекта и перерисовывает
    # читываем текущий угол со слайдера
    # Переводим градусы в радианы
    # Для каждой исходной точки вычисляем её новое положение после поворота
    # Обновляем список rotated_points
    # Перерисовываем всё
    def update_rotation(self, val=None):
        self.angle_deg = self.angle_slider.get()
        angle_rad = math.radians(self.angle_deg)

        self.rotated_points = [
            self.rotate_point(p, self.rotation_point, angle_rad)
            for p in self.original_points
        ]
        self.draw_all()
    
    # Обновляет точку вращения из полей ввода
    # Пытаемся прочитать числа из полей
    # Если введено не число (например, буквы) — ловим ValueError и ничего не делаем
    # Иначе — обновляем точку и пересчитываем поворот
    def update_point_from_entry(self):
        try:
            x = float(self.point_x_entry.get())
            y = float(self.point_y_entry.get())
            self.rotation_point = [x, y]
            self.update_rotation()
        except ValueError:
            pass  # Игнорируем некорректный ввод
    
    # Устанавливает точку вращения по клику мыши
    def set_rotation_point_by_click(self, event):
        # постоянно обновляем при действии rotation_point
        self.rotation_point = [event.x, event.y]
        self.point_x_entry.delete(0, tk.END)
        self.point_y_entry.delete(0, tk.END)
        self.point_x_entry.insert(0, str(event.x))
        self.point_y_entry.insert(0, str(event.y))
        self.update_rotation()

    # Перерисовывает всё на холсте
    def draw_all(self):
        self.canvas.delete("all")

        # Рисуем оси
        self.canvas.create_line(0, self.canvas_height//2, self.canvas_width, self.canvas_height//2, fill="gray", dash=(2,2))
        self.canvas.create_line(self.canvas_width//2, 0, self.canvas_width//2, self.canvas_height, fill="gray", dash=(2,2))

        # Рисуем исходный объект, который не будет менять положение 
        if len(self.original_points) >= 2:
            self.canvas.create_polygon(self.original_points, outline="gray", fill="", dash=(4,4), width=2)

        # Рисуем повёрнутый объект который будет менять свое положение вокруг точки
        if len(self.rotated_points) >= 2:
            self.canvas.create_polygon(self.rotated_points, outline="blue", fill="", width=3)

        # Рисуем точку вращения
        x, y = self.rotation_point
        r = 5
        self.canvas.create_oval(x - r, y - r, x + r, y + r, fill="red")
        self.canvas.create_text(x + 10, y - 10, text="O", fill="red", font=("Arial", 10))

        # Подпись угла в данный момент
        self.canvas.create_text(50, 20, text=f"Угол: {self.angle_deg}°", fill="black", font=("Arial", 12))

# Запуск приложения
if __name__ == "__main__":
    root = tk.Tk()
    app = RotationApp(root)
    root.mainloop()