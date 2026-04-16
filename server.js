const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const open = require('open');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Conectar a SQLite (archivo local)
const db = new sqlite3.Database('./feedback.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    // Crear tabla si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dia TEXT,
        problema TEXT,
        cuentanos TEXT,
        cambiaria TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Ruta para guardar un comentario (POST)
app.post('/api/feedback', (req, res) => {
  const { dia, problema, cuentanos, cambiaria } = req.body;
  const sql = `INSERT INTO feedbacks (dia, problema, cuentanos, cambiaria) VALUES (?, ?, ?, ?)`;
  db.run(sql, [dia, problema, cuentanos, cambiaria], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al guardar el comentario' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Ruta para obtener todos los comentarios (GET) - protegida por contraseña en el frontend
app.get('/api/feedbacks', (req, res) => {
  const sql = `SELECT * FROM feedbacks ORDER BY created_at DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al obtener comentarios' });
    }
    res.json(rows);
  });
});

// Iniciar servidor


app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  // Abrir navegador automáticamente en Windows
  const { exec } = require('child_process');
  exec(`start http://localhost:${PORT}`);
});