import tkinter as tk
import math

# Класс для управления всей программой
class BilinearSurfaceApp:
    # root основное окно tkinter
    # устанавливаем заголовок окна и задаем размеры
    # создаем холст с помощью canvas  и задаем белый фон
    def __init__(self, root):
        self.root = root
        self.root.title("Билинейная поверхность с поворотом")
        self.canvas_width = 700
        self.canvas_height = 500

        self.canvas = tk.Canvas(root, width=self.canvas_width, height=self.canvas_height, bg="white")
        self.canvas.pack()

        # Исходные 4 угловые точки в 3D: (x, y, z)
        # Расположим их как четырёхугольник в пространстве
        # они не лежат в одной плоскости поэтому поверхность будет изогнутой
        self.control_points_3d = [
            [-100, -100, -50],  # P00 нижний левый угол
            [100, -100, 50],    # P10 нижний правый угол
            [-100, 100, 50],    # P01 верхний левый угол
            [100, 100, -50]     # P11 верхний правый угол
        ]
        # инициализация углов поворота 
        self.angle_x = 0  
        self.angle_y = 0  

        # Интерфейс для создания ползунков которые будет находиться в рамке frame
        control_frame = tk.Frame(root)
        # Отступы как padding
        control_frame.pack(pady=10)

        # Поворот вокруг X в диапазоне от -180 до 180 градусов
        # при изменении вызываем метод update_from_sliders
        # ползунок с помощью Scale
        tk.Label(control_frame, text="Поворот вокруг X:").grid(row=0, column=0, padx=5)
        self.slider_x = tk.Scale(control_frame, from_=-180, to=180, orient=tk.HORIZONTAL, length=200,
                                 command=self.update_from_sliders)
        self.slider_x.set(0)
        self.slider_x.grid(row=0, column=1, padx=5)

        # Аналогичный поворот вокруг Y
        tk.Label(control_frame, text="Поворот вокруг Y:").grid(row=0, column=2, padx=5)
        self.slider_y = tk.Scale(control_frame, from_=-180, to=180, orient=tk.HORIZONTAL, length=200,
                                 command=self.update_from_sliders)
        self.slider_y.set(0)
        self.slider_y.grid(row=0, column=3, padx=5)

        tk.Label(root, text="Используйте ползунки для поворота поверхности").pack()

        # рисуем поверхность при запуске
        self.draw_all()

    # Метод поворота точки в 3-д
    def rotate_point_3d(self, point, ang_x, ang_y):
        x, y, z = point

        
        # Поворот вокруг X
        # преобразует углы в радианы
        # игрек и зед меняются, а икс остается
        rad_x = math.radians(ang_x)
        y1 = y * math.cos(rad_x) - z * math.sin(rad_x)
        z1 = y * math.sin(rad_x) + z * math.cos(rad_x)
        y, z = y1, z1

        # Поворот вокруг Y
        # меняются икс и зед, а игрек остается
        rad_y = math.radians(ang_y)
        x2 = x * math.cos(rad_y) + z * math.sin(rad_y)
        z2 = -x * math.sin(rad_y) + z * math.cos(rad_y)
        x, z = x2, z2

        # возвращаем новую 3-д координату после поворота
        return [x, y, z]

    # билинейная интерполяция. вычисляем точку на билинейной поверхности
    def bilinear_interpolation(self, u, v, p00, p10, p01, p11):
        
        # u, v — параметры от 0 до 1, задающие положение на поверхности
        # p00, p10, p01, p11 — угловые точки (уже повёрнутые)
        # формула билинейно интерполяции выглядит так : P(u,v) = (1−u)(1−v)P00 + u(1−v)P10 + (1−u)vP01 + uvP11
        x = (1 - u) * (1 - v) * p00[0] + u * (1 - v) * p10[0] + (1 - u) * v * p01[0] + u * v * p11[0]
        y = (1 - u) * (1 - v) * p00[1] + u * (1 - v) * p10[1] + (1 - u) * v * p01[1] + u * v * p11[1]
        z = (1 - u) * (1 - v) * p00[2] + u * (1 - v) * p10[2] + (1 - u) * v * p01[2] + u * v * p11[2]
        # 3-д точка на поверхности
        return [x, y, z]

    # метод проекции из 3д --> 2д
    def project_to_2d(self, point_3d):
        # Ортогональная проекция: просто отбрасываем Z, смещаем в центр холст
        x, y, z = point_3d
        cx = self.canvas_width // 2
        cy = self.canvas_height // 2
        scale = 1.0  # добавляем масштабирование
        return (cx + x * scale, cy - y * scale)  # инвертируем Y для экранной системы

    # Генерация сетки точек нашей поверхности
    def generate_surface_points(self, steps=20):
        # генерация сетки точек после поворота
        p00, p10, p01, p11 = self.control_points_3d

        # Поворачиваем все 4 угловые точки
        p00_r = self.rotate_point_3d(p00, self.angle_x, self.angle_y)
        p10_r = self.rotate_point_3d(p10, self.angle_x, self.angle_y)
        p01_r = self.rotate_point_3d(p01, self.angle_x, self.angle_y)
        p11_r = self.rotate_point_3d(p11, self.angle_x, self.angle_y)

        # для всех комбинаций (u, v) вычисляем 3-д точку --> проецируем в 2-д
        surface_2d = []
        for i in range(steps + 1):
            u = i / steps
            row = []
            for j in range(steps + 1):
                v = j / steps
                pt_3d = self.bilinear_interpolation(u, v, p00_r, p10_r, p01_r, p11_r)
                pt_2d = self.project_to_2d(pt_3d)
                row.append(pt_2d)
            surface_2d.append(row)
        # получаем двумерный список 2-д координат
        return surface_2d

    # Отрисовываем все изменения
    def draw_all(self):
        # очищаем экран перед прорисовкой
        self.canvas.delete("all")

        # Генерация повернутой поверхности в размере 15 на 15
        grid = self.generate_surface_points(steps=15)

        # Рисуем линии по U (горизонтальные)
        # Каждая строка (row) — это линия при фиксированном u (меняется v)
        # flat — "сплющиваем" список точек вида [(x1,y1), (x2,y2), ...] --> [x1, y1, x2, y2, ...], что требуется create_line
        for row in grid:
            flat = [coord for pt in row for coord in pt]
            self.canvas.create_line(flat, fill="blue", width=1)

        # Рисуем линии по V (вертикальные) аналогично но по столбцам
        # Горизонтальные линии-синии, а вертикальные-красные
        for col_idx in range(len(grid[0])):
            col_points = [grid[row_idx][col_idx] for row_idx in range(len(grid))]
            flat = [coord for pt in col_points for coord in pt]
            self.canvas.create_line(flat, fill="red", width=1)

        # Подписи углов
        # рисуем черные круги в углах и подписываем
        corners_3d = [self.rotate_point_3d(p, self.angle_x, self.angle_y) for p in self.control_points_3d]
        corners_2d = [self.project_to_2d(p) for p in corners_3d]
        labels = ["P00", "P10", "P01", "P11"]
        for (x, y), label in zip(corners_2d, labels):
            self.canvas.create_oval(x-3, y-3, x+3, y+3, fill="black")
            self.canvas.create_text(x+8, y-8, text=label, font=("Arial", 8))
    
    # Обновление экрана при движении ползунков
    # считываем текущие значения углов и перерисовывем все заново
    def update_from_sliders(self, val=None):
        self.angle_x = self.slider_x.get()
        self.angle_y = self.slider_y.get()
        self.draw_all()

# запуск программы
if __name__ == "__main__":
    root = tk.Tk()
    app = BilinearSurfaceApp(root)
    root.mainloop()