const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint para registro
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Por favor, complete todos los campos.' });
    }

    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const params = [name, email, password];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Usuario registrado exitosamente', id: this.lastID });
    });
});

// Endpoint para login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor, ingrese correo y contraseña.' });
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    const params = [email, password];

    db.get(sql, params, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ message: 'Login correcto', user: { id: row.id, name: row.name, email: row.email } });
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
