# CRUD API Project v2

Este proyecto es una aplicación completa que combina un backend desarrollado en Flask y un frontend en React. La aplicación permite gestionar coches y visualizar datos de ventas a través de gráficos interactivos. Incluye funcionalidades CRUD para coches y gráficos dinámicos para analizar las ventas por modelo, país y año.

---

## **Índice**
1. [Características](#características)
2. [Requisitos](#requisitos)
3. [Instalación](#instalación)
4. [Estructura del Proyecto](#project-structure)
5. [Uso](#uso)
6. [Endpoints del Backend](#endpoints-del-backend)
7. [Frontend](#frontend)

---

## **Características**

### **Backend**
- API RESTful desarrollada con Flask.
- Funcionalidades CRUD para gestionar coches.
- Endpoints para consultar datos de ventas agrupados por modelo, país y año.
- Datos almacenados en archivos JSON (`db.json` y `sales.json`).

### **Frontend**
- Interfaz de usuario desarrollada con React y Bootstrap.
- Gráficos interactivos utilizando `react-chartjs-2` y `Chart.js`.
- Modal para seleccionar modelos y visualizar ventas específicas.
- Paginación para la lista de coches.

---

## **Requisitos**

### **Backend**
- Python 3.8 o superior.
- Dependencias especificadas en `requirements.txt`.

### **Frontend**
- Node.js 16 o superior.
- Dependencias especificadas en `package.json`.

---

## **Instalación**

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/crud-api-project-v2.git
cd crud-api-project-v2
```

### **2. Configurar Backend**

1. Crear entorno virtual
```bash
python -m venv venv
source venv/bin/activate
```

2. Instalar dependencias
```bash
pip install -r requirements.txt
```

3. Iniciar el servidor Flask
```bash
python app/main.py
```

### **3. Configurar el Frontend**

1. Navegar el directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Project Structure
```bash
crud-api-project-v2/
├── app/
│   ├── database/
│   │   ├── [db.json](http://_vscodecontentref_/0)          # Base de datos de coches
│   │   ├── [sales.json](http://_vscodecontentref_/1)       # Datos de ventas
│   ├── models/
│   │   ├── car.py           # Modelo de coche
│   │   ├── sale.py          # Modelo de venta
│   ├── routes/
│   │   ├── cars.py          # Endpoints CRUD para coches
│   │   ├── [sales.py](http://_vscodecontentref_/2)         # Endpoints para datos de ventas
│   ├── __init__.py          # Inicialización de la aplicación Flask
│   ├── main.py              # Punto de entrada del backend
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables (CarForm, CarList, etc.)
│   │   ├── pages/           # Páginas principales (SalesCharts.jsx)
│   │   ├── App.jsx          # Configuración de rutas del frontend
│   │   ├── main.jsx         # Punto de entrada del frontend
│   ├── public/              # Archivos estáticos
│   ├── [package.json](http://_vscodecontentref_/3)         # Dependencias del frontend
│   ├── vite.config.js       # Configuración de Vite
├── tests/
│   ├── test_cars.py         # Pruebas unitarias para el backend
├── [requirements.txt](http://_vscodecontentref_/4)         # Dependencias del backend
├── README.md                # Documentación del proyecto
```

## Uso 
### Backend 

1. Inicia el servidor Flask:
```bash
python app/main.py
```

### Frontend 

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Accede a la app en http://127.0.0.1:5173

## Endpoints del Backend 

### Coches 

- `GET/cars:` - Obtener la lista de coches con soporte para búsqueda y paginacion
- `POST /cars:` - Crear un nuevo coche.
- `PUT /cars/<id>:` - Actualizar un coche existente.
- `DELETE /cars/<id>:` - Eliminar un coche.

### Ventas 
- `GET /sales:` - Obtener ventas filtradas por modelo.
- `GET /sales/annual:` - Obtener ventas totales por país.
- `GET /sales/top-models:` - Obtener los modelos más vendidos.
- `GET /sales/total-by-year:` Obtener ventas totales por año.

## Frontend 
### Páginas Principales 
1. Garaje Virtual:
    - Lista de coches con opciones para buscar, editar y eliminar.
    - Botón para crear un nuevo coche.
2. Gráficos de Ventas:
    - Gráficos interactivos para analizar ventas por modelo, país y año.
    - Modal para seleccionar un modelo específico.

### Componentes Clave

- CarForm.jsx: Formulario para crear o editar coches.
- CarList.jsx: Lista de coches con paginación.
- SalesCharts.jsx: Página para visualizar gráficos de ventas.