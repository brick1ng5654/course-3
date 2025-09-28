import numpy as np
import matplotlib.pyplot as plt
# Позволяет создавать 3-д графику
from mpl_toolkits.mplot3d import Axes3D
# специальный объкт для для отрисовки 3-д полигонов
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

# ---------- Параметры освещения ----------
light_pos = np.array([3.0, 4.0, 2.0])      # положение источника света
view_pos = np.array([5.0, 5.0, 5.0])       # положение наблюдателя

# Цвета
light_color = np.array([1.0, 1.0, 1.0])    # белый свет
object_color = np.array([0.2, 0.5, 0.8])   # базовый цвет объекта (RGB)

# Коэффициенты Фонга
ka = 0.2  # амбиентный
kd = 0.6  # диффузный
ks = 0.4  # зеркальный
shininess = 32 # насколько острый блик

# Плоскость пола
ground_y = -1.0

# ---------- Вспомогательные функции ----------

# нормализация вектора
# превращает любой вектор в единичный
# нужно для корректных вычислений углов
def normalize(v):
    norm = np.linalg.norm(v)
    return v / norm if norm != 0 else v

# нормаль к грани
# берется три вершины
#строит два вектора по ребрам
# и векторное произведение дает нормаль к плоскости
# и в конечном итоге нормализует ее
def compute_face_normal(v0, v1, v2):
    # Нормаль к грани (векторное произведение)
    edge1 = v1 - v0
    edge2 = v2 - v0
    normal = np.cross(edge1, edge2)
    return normalize(normal)

# модель освещения Фонга
# вычисляется итоговый цвет грани с учетом, фонового, рассеяного и зеркального освещения
def phong_lighting(face_center, normal, light_pos, view_pos, color):
    
    # вектор от точки к источнику света
    L = normalize(light_pos - face_center)
    # вектор от точки к глазу наблюдателя
    V = normalize(view_pos - face_center)
    # направление отражённого луча света
    R = normalize(2 * np.dot(normal, L) * normal - L)

    # фоновое освещение
    ambient = ka * color

    # Диффузное освещение по закону Ламберта,
    # зависит от косинуса угла между нормалью и светом
    diff = max(np.dot(normal, L), 0) # чтобы небыло отрицательного света
    diffuse = kd * diff * color

    # зеркальный блик, яркость зависит от того, насколько отраженны луч попадает в глаз
    # возводим в степень shininess, чтобы сделать блик узким
    spec = max(np.dot(R, V), 0) ** shininess
    specular = ks * spec * light_color

    # складываем все компоненты
    final_color = ambient + diffuse + specular
    return np.clip(final_color, 0, 1)

# точка тени
# это луч от источника света чеерез точку объекта
# Находим, где он пересекает плоскость пола (Y = ground_y).
# Параметрическое уравнение луча: P(t) = light_pos + t * (point - light_pos)
# Решаем уравнение: P(t).y = ground_y
# Если t < 0 — пересечение позади источника → тени нет.
def project_shadow_point(point, light_pos, ground_y=0):
    direction = point - light_pos
    if direction[1] == 0:
        return None
    t = (ground_y - light_pos[1]) / direction[1]
    if t < 0:
        return None
    return light_pos + t * direction

# тень для всей грани
# проецирует каждую вершину грани на пол
# если хотя-бы одна не проецируется, то тень не рисуем
def project_shadow_polygon(vertices, light_pos, ground_y=0):
    shadow = []
    for v in vertices:
        s = project_shadow_point(np.array(v), np.array(light_pos), ground_y)
        if s is not None:
            shadow.append(s)
        else:
            return None
    return np.array(shadow)

# ---------- Создание куба ----------
def create_cube(size=1.0, center=(0, 0, 0)):
    cx, cy, cz = center
    s = size / 2
    vertices = np.array([
        [cx - s, cy - s, cz - s],
        [cx + s, cy - s, cz - s],
        [cx + s, cy + s, cz - s],
        [cx - s, cy + s, cz - s],
        [cx - s, cy - s, cz + s],
        [cx + s, cy - s, cz + s],
        [cx + s, cy + s, cz + s],
        [cx - s, cy + s, cz + s],
    ])
    faces = [
        [0, 1, 2, 3],  # задняя
        [4, 7, 6, 5],  # передняя
        [0, 4, 5, 1],  # нижняя
        [2, 6, 7, 3],  # верхняя
        [0, 3, 7, 4],  # левая
        [1, 5, 6, 2],  # правая
    ]
    return vertices, faces

# Создаём куб размером 2, в центре координат.
cube_vertices, cube_faces = create_cube(size=2.0, center=(0, 0, 0))

# ---------- Вычисление цветов граней и теней ----------

# списки для хранения цветов граней и их теней
face_colors = []
shadow_polys = []

#для каждой грани находим:
# центр и нормаль
# вычисляем цвет по Фонгу
# проецируем грань на пол, т.е получаем цвет
for face in cube_faces:
    verts = cube_vertices[face]
    # Центр грани
    center = np.mean(verts, axis=0)
    # Нормаль (берём первые 3 точки)
    normal = compute_face_normal(verts[0], verts[1], verts[2])
    # Освещение по Фонгу
    color = phong_lighting(center, normal, light_pos, view_pos, object_color)
    face_colors.append(color)

    # Тень этой грани на пол
    shadow = project_shadow_polygon(verts, light_pos, ground_y)
    if shadow is not None:
        shadow_polys.append(shadow)

# Цвет тени — только амбиентный
shadow_color = ka * object_color  # без диффузного и зеркального

# ---------- Визуализация ----------

# создаем 3-д графику
fig = plt.figure(figsize=(12, 9))
ax = fig.add_subplot(111, projection='3d')

# Рисуем кубPoly3DCollection принимает список полигонов.
# Каждая грань — отдельный полигон с вычисленным цветом.
# edgecolors='k' — чёрные рёбра.
# alpha=0.9 — чуть прозрачный.
for i, face in enumerate(cube_faces):
    verts = [cube_vertices[face]]
    ax.add_collection3d(Poly3DCollection(
        verts, facecolors=face_colors[i], edgecolors='k', linewidths=0.5, alpha=0.9
    ))

# Рисуем тени на полу
for shadow in shadow_polys:
    if len(shadow) >= 3:
        ax.add_collection3d(Poly3DCollection(
            [shadow], facecolors=shadow_color, alpha=0.5
        ))

# Источник света и наблюдатель
# желтая точка - свет
# красная точка - наблюдатель
ax.scatter(*light_pos, color='yellow', s=150, label='Light', edgecolor='black')
ax.scatter(*view_pos, color='red', s=100, label='Viewer', edgecolor='black')

# Пол
floor = np.array([
    [-3, ground_y, -3],
    [3, ground_y, -3],
    [3, ground_y, 3],
    [-3, ground_y, 3]
])
ax.add_collection3d(Poly3DCollection([floor], facecolors='lightgray', alpha=0.3))

# Настройки
# устанавливаем границы, подписи , легенду, заголовок
ax.set_xlim([-4, 4])
ax.set_ylim([-2, 6])
ax.set_zlim([-4, 4])
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.legend()
ax.set_title('Освещение по Фонгу + Тени (Задача 3)')

plt.show()