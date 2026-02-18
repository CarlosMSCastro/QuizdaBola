const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // validar inputs
        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password são obrigatórios' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password deve ter pelo menos 6 caracteres' });
        }

        // verificar se username já existe
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username já existe' });
        }

        // encriptar password
        const hashedPassword = await bcrypt.hash(password, 10);

        // inserir user na BD
        const [result] = await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        // criar token JWT
        const token = jwt.sign(
            { id: result.insertId, username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Utilizador criado com sucesso',
            token,
            user: { id: result.insertId, username }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao registar utilizador' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // validar inputs
        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password são obrigatórios' });
        }

        // buscar user na BD
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Username ou password incorretos' });
        }

        const user = users[0];

        // verificar password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Username ou password incorretos' });
        }

        // criar token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login bem-sucedido',
            token,
            user: { id: user.id, username: user.username }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

module.exports = router;