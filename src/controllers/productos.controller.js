const pool = require('../config/db');

// Obtener todos los productos
const getProductos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// Crear producto
const createProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;

        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, precio, stock]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

module.exports = {
    getProductos,
    createProducto
};
