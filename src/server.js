const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// Configuración PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

//////////////////////////
// ENDPOINT RAÍZ
//////////////////////////

app.get('/', (req, res) => {
  res.send('<h1>Backend funcionando 🔥</h1>');
});

//////////////////////////
// PRODUCTOS PÚBLICOS
//////////////////////////

app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

//////////////////////////
// REGISTRO Y LOGIN
//////////////////////////

app.post('/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!['admin', 'bodega'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    const existe = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      [nombre, email, hashedPassword, rol]
    );

    const usuario = result.rows[0];

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ usuario, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    const usuario = result.rows[0];
    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

//////////////////////////
// MIDDLEWARE JWT
//////////////////////////

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

//////////////////////////
// MIDDLEWARE ROL
//////////////////////////

const roleMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado por rol' });
    }
    next();
  };
};

//////////////////////////
// PRODUCTOS BODEGA (SOLO LECTURA)
//////////////////////////

app.get(
  '/bodega/productos',
  authMiddleware,
  roleMiddleware(['bodega']),
  async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM productos');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }
);

//////////////////////////
// CRUD PRODUCTOS (SOLO ADMIN)
//////////////////////////

app.get(
  '/admin/productos',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  }
);

app.post(
  '/admin/productos',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria_id } = req.body;

    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [nombre, descripcion, precio, stock, categoria_id]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }
);

app.put(
  '/admin/productos/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria_id } = req.body;

    try {
      const result = await pool.query(
        `UPDATE productos
         SET nombre=$1, descripcion=$2, precio=$3, stock=$4, categoria_id=$5
         WHERE id=$6
         RETURNING *`,
        [nombre, descripcion, precio, stock, categoria_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  }
);

app.delete(
  '/admin/productos/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        'DELETE FROM productos WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ mensaje: 'Producto eliminado', producto: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
);

//////////////////////////
// START SERVER
//////////////////////////

app.listen(port, () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});

