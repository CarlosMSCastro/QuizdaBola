import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register, login } from '../services/api';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const mode = searchParams.get('mode');
    const [isLogin, setIsLogin] = useState(mode !== 'register');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = isLogin 
                ? await login(username, password)
                : await register(username, password);

            const { token, user } = response;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            onLogin(token, user);

            const redirect = searchParams.get('redirect');
            navigate(redirect || '/');
        } catch (err) {
            setError(err.response?.data?.error || t('auth.error'));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setUsername('');
        setPassword('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-semibold"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Voltar</span>
                </button>

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-primary tracking-tight">
                        {isLogin ? t('auth.login') : t('auth.register')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wide">
                            {t('auth.username')}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl text-foreground bg-foreground/5 border-2 border-primary text-lg font-medium focus:outline-none focus:border-primary focus:bg-foreground/10 transition-all placeholder:text-muted-foreground"
                            placeholder={isLogin ? t('auth.usernameLoginPlaceholder') : t('auth.usernamePlaceholder')}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-primary mb-3 uppercase tracking-wide">
                            {t('auth.password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-foreground/5 text-foreground border-2 border-primary text-lg font-medium focus:outline-none focus:border-primary focus:bg-foreground/10 transition-all placeholder:text-muted-foreground"
                            placeholder={isLogin ? t('auth.passwordLoginPlaceholder') : t('auth.passwordPlaceholder')}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border-2 border-destructive/30 text-destructive px-5 py-4 rounded-2xl text-sm font-semibold">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xl uppercase tracking-wide hover:bg-primary/90 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? t('common.loading') : (isLogin ? t('auth.login') : t('auth.register'))}
                    </button>
                </form>

                {/* Toggle */}
                <div className="text-center pt-4">
                    <button
                        onClick={toggleMode}
                        className="text-foreground hover:text-primary font-semibold transition-colors text-base underline underline-offset-4"
                    >
                        {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;