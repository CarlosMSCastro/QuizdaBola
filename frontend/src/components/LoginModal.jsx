import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { login, register } from '../services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function LoginModal({ open, onClose, onSuccess }) {
    const { t } = useTranslation();
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

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            onSuccess(data.token, data.user);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || t('common.error'));
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isLogin ? t('auth.login') : t('auth.register')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder={t('auth.username')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full p-2 border rounded bg-background text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder={t('auth.password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full p-2 border rounded bg-background text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? t('auth.processing') : isLogin ? t('auth.loginButton') : t('auth.registerButton')}
                    </Button>

                    <Button 
                        type="button"
                        variant="ghost" 
                        className="w-full text-foreground"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? t('auth.switchToRegister') : t('auth.switchToLogin')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default LoginModal;