import matplotlib.pyplot as plt
import numpy as np
import math
from matplotlib.widgets import Slider

# описание многогранника
# vertices — список координат вершин (x, y, z).
# faces — список граней, каждая грань — это список индексов вершин.
# color_front / color_back — цвета для лицевых и обратных граней (чтобы видеть, какая сторона "смотрит на нас").
class Polyhedron:
    def __init__(self, vertices, faces, color_front='lightblue', color_back='lightcoral'):
        self.vertices = np.array(vertices)
        self.faces = faces
        self.color_front = color_front
        self.color_back = color_back
    # Возвращает центр грани
    def get_face_center(self, face):
        return np.mean(self.vertices[face], axis=0)

    # вычисляет нормаль к грани
    # использует векторное произведение двух ребер(v1 v2)
    # нормализует вектоор(делит на длину), чтобы он был еденичным
    # если грань вырождена(меньше 3 точек), то возвращает заглушку 0 0 1
    def get_face_normal(self, face):
        pts = self.vertices[face]
        if len(pts) < 3:
            return np.array([0, 0, 1])
        v1 = pts[1] - pts[0]
        v2 = pts[2] - pts[0]
        normal = np.cross(v1, v2)
        norm = np.linalg.norm(normal)
        return normal / norm if norm != 0 else np.array([0, 0, 1])

# Возвращает матрицу поворота вокруг Х на заданный угол
def rotation_matrix_x(angle):
    c, s = math.cos(angle), math.sin(angle)
    return np.array([[1, 0, 0],
                     [0, c, -s],
                     [0, s, c]])

# Аналогичный поворот только вокруг У
def rotation_matrix_y(angle):
    c, s = math.cos(angle), math.sin(angle)
    return np.array([[c, 0, s],
                     [0, 1, 0],
                     [-s, 0, c]])

# Создает куб с 8-ю вершинами, 6-ю гранями
def create_cube(center=(0, 0, 0), size=1.0):
    cx, cy, cz = center
    s = size / 2
    v = [
        [cx - s, cy - s, cz - s],
        [cx + s, cy - s, cz - s],
        [cx + s, cy + s, cz - s],
        [cx - s, cy + s, cz - s],
        [cx - s, cy - s, cz + s],
        [cx + s, cy - s, cz + s],
        [cx + s, cy + s, cz + s],
        [cx - s, cy + s, cz + s],
    ]
    f = [[0,1,2,3], [4,5,6,7], [0,1,5,4], [2,3,7,6], [0,3,7,4], [1,2,6,5]]
    return Polyhedron(v, f)

# Создание тетраэдра с 4-мя вершинами т 4-мя гранями
def create_tetrahedron(center=(0, 0, 0), size=1.0):
    cx, cy, cz = center
    s = size
    v = [
        [cx, cy, cz + s],
        [cx + s, cy, cz - s/3],
        [cx - s/2, cy + s*math.sqrt(3)/2, cz - s/3],
        [cx - s/2, cy - s*math.sqrt(3)/2, cz - s/3],
    ]
    f = [[0,1,2], [0,2,3], [0,3,1], [1,3,2]]
    return Polyhedron(v, f)

# ax — оси matplotlib.
# polyhedra — список объектов Polyhedron.
# view_dir — направление взгляда (по умолчанию — вдоль оси Z, от нас к экрану).
def render_with_z_sort(ax, polyhedra, view_dir=np.array([0, 0, -1])):
    # для каждой грани находим центр и нормаль
    all_faces = []
    for poly in polyhedra:
        for face in poly.faces:
            center = poly.get_face_center(face)
            normal = poly.get_face_normal(face)
            # скалярное произведение показывает смотрит ли грань на нас
            # если больще 0 -->лицевая-->color_front
            # иначе-->обратная-->color_back
            dot = np.dot(normal, -view_dir)
            color = poly.color_front if dot > 0 else poly.color_back
            # берем только х и у
            projected = poly.vertices[face][:, :2]
            # глубина по зед, для сортироовки
            z_depth = center[2]
            #сортируем грани от самых дальних к самым ближним
            # это замена z-buffer, сначала рисуем дальние потом ближние - они перекроют
            all_faces.append((z_depth, projected, color))
    all_faces.sort(key=lambda x: x[0])  # сортировка по Z (дальние → ближние)
    
    # очищаем оси и задаем пределы отображения
    ax.clear()
    ax.set_xlim(-4, 4)
    ax.set_ylim(-4, 4)
    ax.set_aspect('equal')

    # рисуем каждую грань как 2-д полигон с цветом и черной обводкой
    for _, verts, color in all_faces:
        poly_patch = plt.Polygon(verts, closed=True, facecolor=color, edgecolor='k', alpha=0.85)
        ax.add_patch(poly_patch)

# ---------- Основная программа ----------
# Исходные объекты (без поворота)
# три объекта создаются
base_objects = [
    create_cube(center=(0, 0, 0), size=2),
    create_tetrahedron(center=(1.5, 1.5, 1), size=1.2),
    create_cube(center=(-2, 1, -1), size=1),
]

# Создаём фигуру и оси
fig, ax = plt.subplots(figsize=(9, 8))
plt.subplots_adjust(left=0.2, bottom=0.25)

# Начальные углы и место для слайдеров
angle_x0 = 0.0
angle_y0 = 0.0

# Применяем начальный поворот и рисуем
# сначала поворчиваем вокруг Х , а потом У
# для каждого созлается копия и поворачиваются все вершины
def apply_rotation_and_render(angle_x, angle_y):
    R = rotation_matrix_y(angle_y) @ rotation_matrix_x(angle_x)
    current_objects = []
    for obj in base_objects:
        new_obj = Polyhedron(obj.vertices.copy(), obj.faces, obj.color_front, obj.color_back)
        new_obj.vertices = (R @ new_obj.vertices.T).T
        current_objects.append(new_obj)
    # отрисовываем с сортировкой
    render_with_z_sort(ax, current_objects)

# рисуем начальное состояние
apply_rotation_and_render(angle_x0, angle_y0)

# Создаём слайдеры
ax_angle_x = plt.axes([0.2, 0.1, 0.65, 0.03])
ax_angle_y = plt.axes([0.2, 0.05, 0.65, 0.03])

# от -пи до пи
slider_x = Slider(ax_angle_x, 'Угол X (рад)', -np.pi, np.pi, valinit=angle_x0)
slider_y = Slider(ax_angle_y, 'Угол Y (рад)', -np.pi, np.pi, valinit=angle_y0)

# Обработчики изменений пересчитываем поворот и перерисовываем
def update(val):
    apply_rotation_and_render(slider_x.val, slider_y.val)
    fig.canvas.draw_idle()

# привязываем функцию update к изменениям слайдера
slider_x.on_changed(update)
slider_y.on_changed(update)

# Подписи
ax.set_title("Алгоритм сортировки по Z\nЛицевые — голубые, обратные — коралловые", fontsize=12)

plt.show()