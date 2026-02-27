import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function BugReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Buscar username do localStorage ou definir como 'guest'
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const username = user.username || 'guest';

            await fetch(`${API_URL}/api/bug-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    page: location.state?.fromPage || '/',
                    user_agent: navigator.userAgent,
                    username // ← Envia username
                })
            });
            
            setSuccess(true);
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            console.error('Erro ao enviar bug report:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    aria-label={t('common.back')}
                    className="p-2 md:p-3 rounded-xl bg-primary hover:scale-105 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-primary tracking-tight">
                        {t('bugReport.title')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t('bugReport.subtitle')}
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="bug-message" className="block text-sm font-bold text-primary mb-3 uppercase tracking-wide">
                                {t('bugReport.label')}
                            </label>
                            <textarea
                                id="bug-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl text-foreground bg-foreground/5 border-2 border-primary text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all placeholder:text-muted-foreground resize-none"
                                placeholder={t('bugReport.placeholder')}
                                rows={8}
                                required
                                minLength={10}
                                aria-required="true"
                                aria-describedby="message-help"
                            />
                            <p id="message-help" className="sr-only">
                                {t('bugReport.helpText')}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xl uppercase tracking-wide hover:bg-primary/90 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            {loading ? t('common.loading') : t('bugReport.submit')}
                        </button>
                    </form>
                ) : (
                    <div 
                        className="text-center py-12 space-y-4 animate-in zoom-in duration-300"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="text-6xl" aria-hidden="true">✅</div>
                        <h2 className="text-3xl font-black text-success">
                            {t('bugReport.thanks')}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            {t('bugReport.successMessage')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('bugReport.redirecting')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BugReport;