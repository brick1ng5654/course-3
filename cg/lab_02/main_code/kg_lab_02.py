import tkinter as tk
import math

class BSplineApp:
    # Инициализация окна, добавление текста и привязка мыши к реакции
    def __init__(self, root):
        self.root = root
        self.root.title("Интерактивный B-сплайн (степени 1–6)")
        self.canvas_width = 800
        self.canvas_height = 600
        #Создаем холст для области рисования и добавляем в окно
        self.canvas = tk.Canvas(root, width=self.canvas_width, height=self.canvas_height, bg="white")
        self.canvas.pack()

        # Вычисляем центр холста и расставляем 7 точек в радиусе 150 пикселей
        cx, cy = self.canvas_width // 2, self.canvas_height // 2
        radius = 150
        self.control_points = [
            (cx + radius * math.cos(2 * math.pi * i / 7), cy + radius * math.sin(2 * math.pi * i / 7))
            for i in range(7)
        ]
        # self.selected_point индекс точки, которую сейчас тащят мышью или none если нет действий
        self.selected_point = None
        self.degree = 3  # по умолчанию — кубический

        # Создает рамку фрейм где у нас располагаются инструменты для редактирования степени
        control_frame = tk.Frame(root)
        control_frame.pack(pady=10)

        tk.Label(control_frame, text="Степень B-сплайна:").pack(side=tk.LEFT, padx=5)
        # создаем degree_var для связи с радиокнопками которые будут иметь 6 степений при их выборе вызывается on_degree_change
        self.degree_var = tk.IntVar(value=self.degree)
        for d in range(1, 7):
            tk.Radiobutton(control_frame, text=str(d), variable=self.degree_var, value=d,
                           command=self.on_degree_change).pack(side=tk.LEFT, padx=2)

        tk.Label(root, text="Перетаскивайте точки, чтобы редактировать").pack(pady=5)

        # Привязка событий мыши
        self.canvas.bind("<Button-1>", self.on_click)# нажатие мыши
        self.canvas.bind("<B1-Motion>", self.on_drag)# нажатие мыши и движение
        self.canvas.bind("<ButtonRelease-1>", self.on_release)# отпусскание мыши
        # рисуем все в первый раз
        self.draw_all()

    # при смене степени обновляем self.degree и перерисовываем
    def on_degree_change(self):
        self.degree = self.degree_var.get()
        self.draw_all()

    # Проверяем: кликнули ли в пределах 10 пикселей от какой-то точки 
    def on_click(self, event):
        for i, (x, y) in enumerate(self.control_points):
            if (x - event.x) ** 2 + (y - event.y) ** 2 <= 100:  # 10^2
                self.selected_point = i #запоминаем ее индекс
                break
    # Если точка выбрана перересовываем и оновляем координаты            
    def on_drag(self, event):
        if self.selected_point is not None:
            self.control_points[self.selected_point] = (event.x, event.y)
            self.draw_all()
    # Когда отпустили сбрасываем выбор
    def on_release(self, event):
        self.selected_point = None

    # === B-сплайн реализация ===

    # n-индекс последней управляющей точки
    # p-степень сплайна
    # Начинаем узловой вектор с p+1 нулей (для clamped-сплайна)
    def make_knot_vector(self, n, p):
        """
        Создаёт clamped (непериодический) узловой вектор для n+1 точек и степени p.
        Длина: m+1 = n + p + 2
        Пример для n=6, p=3: [0,0,0,0,1,2,3,4,5,5,5,5]
        """
        m = n + p + 1
        knot = [0] * (p + 1)
        # Сколько внутренних узлов нужно добавить между 1 и 0
        inner_knots = m - 2 * (p + 1) + 1
        # Добавляем равномерные внутренние узлы
        if inner_knots > 0:
            step = 1.0 / (inner_knots + 1)
            for i in range(1, inner_knots + 1):
                knot.append(i * step)
        else:
            # Если точек мало для внутренних узлов — просто повторяем
            pass
        # Завершаем p+1 единицами
        knot += [1.0] * (p + 1)
        return knot

    def basis_function(self, i, p, t, knot):
        """Рекурсивное вычисление базисной функции N_{i,p}(t)"""
        # Базовый случай: степень 0 → функция равна 1, если t в интервале
        if p == 0:
            return 1.0 if knot[i] <= t < knot[i + 1] else 0.0
        
        # Рекурсивно вычисляем первую часть формулы Кокса–де Бура
        else:
            denom1 = knot[i + p] - knot[i]
            c1 = 0.0
            if denom1 > 1e-10:
                c1 = (t - knot[i]) / denom1 * self.basis_function(i, p - 1, t, knot)

            # Вторая часть + сумма → полная базисная функция.
            denom2 = knot[i + p + 1] - knot[i + 1]
            c2 = 0.0
            if denom2 > 1e-10:
                c2 = (knot[i + p + 1] - t) / denom2 * self.basis_function(i + 1, p - 1, t, knot)

            # Соединяем
            return c1 + c2
    # Для параметра t вычисляем взвешенную сумму управляющих точек с весами N_{i,p}(t)
    def evaluate_bspline(self, t, control_points, p, knot):
        """Вычисляет точку на B-сплайне при параметре t"""
        n = len(control_points) - 1  # индекс последней точки
        x = y = 0.0
        for i in range(n + 1):
            N = self.basis_function(i, p, t, knot)
            xi, yi = control_points[i]
            x += N * xi
            y += N * yi
        return x, y
    # Если степень слишком высока (например, 6 точек → макс. степень 5), ограничиваем
    def generate_curve_points(self, control_points, p, num_samples=300):
        """Генерирует точки кривой для отрисовки"""
        n = len(control_points) - 1
        if p > n:
            p = n  # нельзя выше, чем n
        # Диапазон параметра t: от knot[p] до knot[n+1]
        knot = self.make_knot_vector(n, p)
        t_start = knot[p]
        t_end = knot[n + 1]
        # Защита от деления на ноль
        if abs(t_end - t_start) < 1e-10:
            return []
        # Генерируем 301 точку (включая концы) для плавной кривой.
        curve_points = []
        for i in range(num_samples + 1):
            t = t_start + (t_end - t_start) * i / num_samples
            # Обработка конечной точки
            if i == num_samples:
                t = t_end
            pt = self.evaluate_bspline(t, control_points, p, knot)
            curve_points.append(pt)
        return curve_points

    # === Отрисовка ===

    def draw_all(self):
        # Стираем все на холсте
        self.canvas.delete("all")

        # Генерация и отрисовка B-сплайна
        # Преобразуем список [(x1,y1), (x2,y2), ...] в плоский список [x1,y1,x2,y2,...]
        curve_pts = self.generate_curve_points(self.control_points, self.degree)
        if len(curve_pts) > 1:
            flat = [coord for pt in curve_pts for coord in pt]
            self.canvas.create_line(flat, fill="blue", width=2, smooth=False)

        # Рисуем каждую управляющую точку: чёрная или красная
        for i, (x, y) in enumerate(self.control_points):
            # Точка
            r = 5
            color = "red" if i == self.selected_point else "black"
            self.canvas.create_oval(x - r, y - r, x + r, y + r, fill=color, outline="black")
            # Подпись
            self.canvas.create_text(x + 10, y - 10, text=f"P{i}", fill="gray", font=("Arial", 8))

        # Рисуем серую пунктирную полилинию между управляющими точками
        if len(self.control_points) > 1:
            flat_ctrl = [coord for pt in self.control_points for coord in pt]
            self.canvas.create_line(flat_ctrl, fill="gray", dash=(3, 3), width=1)

        # Подпись степени
        self.canvas.create_text(50, 20, text=f"Степень: {self.degree}", fill="black", font=("Arial", 12))


# Запуск
if __name__ == "__main__":
    root = tk.Tk()
    app = BSplineApp(root)
    root.mainloop()