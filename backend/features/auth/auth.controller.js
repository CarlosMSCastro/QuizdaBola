const service = require('./auth.service');

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validar dados
        service.validateRegisterData(req.body);
        
        // Verificar se username já existe
        const exists = await service.checkUsernameExists(username);
        if (exists) {
            return res.status(409).json({ error: 'Username já existe' });
        }
        
        // Criar user
        const user = await service.createUser(username, password);
        
        // Gerar token
        const token = service.generateToken(user);
        
        res.status(201).json({
            message: 'Utilizador criado com sucesso',
            token,
            user: { id: user.id, username: user.username }
        });
        
    } catch (error) {
        console.error(error);
        
        if (error.message.includes('obrigatórios') || error.message.includes('caracteres')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Erro ao registar utilizador' });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validar dados
        service.validateLoginData(req.body);
        
        // Procurar User
        const user = await service.findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Username ou password incorretos' });
        }
        
        // Verificar password
        const validPassword = await service.verifyPassword(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Username ou password incorretos' });
        }
        
        // Gerar token
        const token = service.generateToken(user);
        
        res.json({
            message: 'Login bem-sucedido',
            token,
            user: { id: user.id, username: user.username }
        });
        
    } catch (error) {
        console.error(error);
        
        if (error.message.includes('obrigatórios')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};