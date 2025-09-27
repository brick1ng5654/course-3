import matplotlib.pyplot as plt
import random

# Определяем битовые маски для четырёх границ прямоугольного окна
#TOP — точка выше верхней границы (y > ymax)
#BOTTOM — ниже нижней (y < ymin)
#RIGHT — правее правой (x > xmax)
#LEFT — левее левой (x < xmin)
TOP = 8    # 1000
BOTTOM = 4 # 0100
RIGHT = 2  # 0010
LEFT = 1   # 0001

#Функция вычисления кода точки. принимает координаты точки (x, y) и границы окна
def compute_code(x, y, xmin, xmax, ymin, ymax):
    # Вычисляет 4-битовый код точки относительно окна.
    code = 0
    # если точка левее окна
    if x < xmin:
        code |= LEFT
    # Если точка правее окна
    elif x > xmax:
        code |= RIGHT
    # если точка ниже окна
    if y < ymin:
        code |= BOTTOM
    # если точка выше окна
    elif y > ymax:
        code |= TOP
    # возвращаем итоговый 4-битовый код точки
    return code

# функция алгоритма Коэна-Сазерленда
def cohen_sutherland_clip(x1, y1, x2, y2, xmin, xmax, ymin, ymax):
    # Вычисляем коды для обоих концов отрезка
    code1 = compute_code(x1, y1, xmin, xmax, ymin, ymax)
    code2 = compute_code(x2, y2, xmin, xmax, ymin, ymax)
    # Флаг для проверки попадания отрезка в окно полностью или частично
    accept = False

    # цикл пока не примем или отбросим отрезок
    while True:
        # условие побитого ИЛИ равно 0
        if not (code1 | code2):  # оба конца внутри окна
            accept = True
            break
        # Если побитовое И не равно 0
        elif code1 & code2:  # оба конца в одной внешней области — отбрасываем
            break
        # Иначе отрезок будет частично виден
        else:

            # Выбираем внешнюю точку для пересчёта
            x, y = 0, 0
            code_out = code1 if code1 != 0 else code2

            # Находим точку пересечения с границей окна
            # Используем параметрическое уравнение прямой
            if code_out & TOP:
                x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1)
                y = ymax
            elif code_out & BOTTOM:
                x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1)
                y = ymin
            elif code_out & RIGHT:
                y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1)
                x = xmax
            elif code_out & LEFT:
                y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1)
                x = xmin

            # Заменяем внешнюю точку на точку пересечения
            # Пересчитываем ее код. Отрезок укорочен
            if code_out == code1:
                x1, y1 = x, y
                code1 = compute_code(x1, y1, xmin, xmax, ymin, ymax)
            else:
                x2, y2 = x, y
                code2 = compute_code(x2, y2, xmin, xmax, ymin, ymax)

    if accept:
        return (x1, y1, x2, y2)
    else:
        return None

# Параметры окна отсечения
xmin, xmax = 20, 80
ymin, ymax = 20, 80

# Генерация случайных отрезков
num_segments = 30
segments = []
for _ in range(num_segments):
    x1 = random.uniform(0, 100)
    y1 = random.uniform(0, 100)
    x2 = random.uniform(0, 100)
    y2 = random.uniform(0, 100)
    segments.append((x1, y1, x2, y2))

# Визуализация
plt.figure(figsize=(10, 8))

# Рисуем все исходные отрезки серым цветом
for (x1, y1, x2, y2) in segments:
    plt.plot([x1, x2], [y1, y2], color='lightgray', linewidth=1)

# Рисуем окно отсечения
plt.plot([xmin, xmax, xmax, xmin, xmin],
         [ymin, ymin, ymax, ymax, ymin],
         color='black', linewidth=2, linestyle='--', label='Окно отсечения')

# Применяем алгоритм Коэна–Сазерленда и рисуем видимые части отрезков
# Если результат не None — рисуем видимую часть красным.
for (x1, y1, x2, y2) in segments:
    clipped = cohen_sutherland_clip(x1, y1, x2, y2, xmin, xmax, ymin, ymax)
    if clipped:
        xc1, yc1, xc2, yc2 = clipped
        plt.plot([xc1, xc2], [yc1, yc2], color='red', linewidth=2)

plt.xlim(0, 100)
plt.ylim(0, 100)
plt.gca().set_aspect('equal', adjustable='box')
plt.title('Алгоритм Коэна–Сазерленда: отсечение отрезков прямоугольным окном')
plt.legend()
plt.grid(True, linestyle=':', alpha=0.6)
plt.show()