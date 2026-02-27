const db = require('../../shared/config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Validar dados de registro
exports.validateRegisterData = (data) => {
    const { username, password } = data;
    
    if (!username || !password) {
        throw new Error('Username e password são obrigatórios');
    }

    if (password.length < 6) {
        throw new Error('Password deve ter pelo menos 6 caracteres');
    }
};

// Validar dados de login
exports.validateLoginData = (data) => {
    const { username, password } = data;
    
    if (!username || !password) {
        throw new Error('Username e password são obrigatórios');
    }
};

// Verificar se username já existe
exports.checkUsernameExists = async (username) => {
    const [existing] = await db.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
    );
    
    return existing.length > 0;
};

// Criar novo usuário
exports.createUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
    );
    
    return { id: result.insertId, username };
};

// Buscar usuário por username
exports.findUserByUsername = async (username) => {
    const [users] = await db.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );
    
    return users.length > 0 ? users[0] : null;
};

// Verificar password
exports.verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Gerar token JWT
exports.generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};