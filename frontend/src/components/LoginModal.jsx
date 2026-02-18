import { useState } from 'react';
import { login, register } from '../services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function LoginModal({ open, onClose, onSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = isLogin 
                ? await login(username, password)
                : await register(username, password);

            // guardar token no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            onSuccess(data.token, data.user);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao autenticar');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isLogin ? '🔐 Login' : '📝 Registo'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'A processar...' : isLogin ? 'Entrar' : 'Registar'}
                    </Button>

                    <Button 
                        type="button"
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Criar conta nova' : 'Já tenho conta'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default LoginModal;