📦 Inventario de Productos – Backend Node.js
📦 Product Inventory – Node.js Backend

Sistema backend para la gestión de productos con autenticación **JWT** y control de acceso por **roles**, desarrollado en **Node.js + Express**.  
Incluye una **interfaz web moderna** para visualizar y administrar productos según el rol del usuario.



🚀 Características | Features

## Español 🇨🇱

- Autenticación con JSON Web Tokens (JWT)
- Control de acceso por roles (`admin`, `bodega`)
- CRUD completo de productos
- Interfaz web integrada (HTML, CSS y JavaScript)
- Rutas protegidas según rol
- Conexión a base de datos SQL
- Arquitectura modular y escalable

### English 🇺🇸
- JWT-based authentication
- Role-based access control (`admin`, `warehouse`)
- Full product CRUD operations
- Integrated modern web dashboard
- Role-protected routes
- SQL database connection
- Modular and scalable architecture

---

## 👥 Roles del sistema | System Roles

### 🔑 Admin
- Crear productos
- Editar productos
- Eliminar productos
- Ver listado completo de productos

### 📦 Bodega / Warehouse
- Visualizar productos
- Acceso solo lectura

---

## 🛠 Tecnologías | Tech Stack

- Node.js
- Express.js
- JSON Web Tokens (JWT)
- SQL Database
- HTML5 / CSS3 / JavaScript
- Git & GitHub

---

## 📂 Estructura del proyecto | Project Structure

```
inventario-backend/
│
├── public/
│   └── index.html
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── productos.controller.js
│   ├── routes/
│   │   └── productos.routes.js
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Instalación y ejecución | Installation & Run

### 1️⃣ Clonar el repositorio | Clone repository
```bash
git clone https://github.com/ianking24/inventario-productos-node.git
cd inventario-productos-node
```

### 2️⃣ Instalar dependencias | Install dependencies
```bash
npm install
```

### 3️⃣ Configurar base de datos | Configure database
Editar el archivo:
```bash
src/config/db.js
```
con las credenciales locales de tu base de datos  
*(no incluidas por seguridad)*

---

### 4️⃣ Ejecutar el servidor | Run server
```bash
npm start
```

Servidor disponible en:
```
http://localhost:3000
```

---

## 🌐 Interfaz Web | Web Dashboard

Accede desde el navegador:
```
http://localhost:3000
```

✔ Login con email y contraseña  
✔ Visualización de productos  
✔ Acciones habilitadas según rol  

---

## 🔐 Autenticación | Authentication

El sistema utiliza **JWT (Bearer Token)** para proteger las rutas.

Ejemplo de header:
```http
Authorization: Bearer TU_TOKEN_AQUI
```

---

## 📌 Endpoints principales | Main Endpoints

### Autenticación
```
POST /login
```

### Productos (Admin)
```
GET    /admin/productos
POST   /admin/productos
PUT    /admin/productos/:id
DELETE /admin/productos/:id
```

### Productos (Bodega)
```
GET /productos-protegidos
```

---

## 👨‍💻 Autor | Author

**Ian Catalán**  
Backend Developer – Node.js  
Chile 🇨🇱  

GitHub:  
👉 https://github.com/ianking24

---

## 📄 Licencia | License

Este proyecto se publica con fines educativos y demostrativos.
