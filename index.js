const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // Importar el middleware cors

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors()); // Usar el middleware cors

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'mysql',  // O usa '127.0.0.1'
  user: 'test',
  password: 'test',
  database: 'test'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Endpoint para crear una nueva tarea
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  
  // Verificar y crear la tabla tasks si no existe
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error ensuring tasks table exists:', err);
      res.status(500).json({ error: 'Error ensuring tasks table exists' });
      return;
    }

    // Insertar la nueva tarea
    const insertQuery = 'INSERT INTO tasks (title, description) VALUES (?, ?)';
    db.query(insertQuery, [title, description], (err, results) => {
      if (err) {
        console.error('Error inserting task:', err);
        res.status(500).json({ error: 'Error inserting task' });
        return;
      }
      res.status(201).json({ id: results.insertId, title, description });
    });
  });
});

// Endpoint para obtener todas las tareas
app.get('/', (req, res) => {
  const query = 'SELECT * FROM tasks';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Error fetching tasks' });
      return;
    }
    res.status(200).json(results);
  });
});

// Endpoint para borrar una tarea por id
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM tasks WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: 'Error deleting task' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
