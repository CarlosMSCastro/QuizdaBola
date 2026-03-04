import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../shared/services/api';
import { Card } from '@/shared/components/ui/card';

function Admin({ token }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;
    
    if (userData?.username !== 'CarlosCastro') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getStats(token);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-foreground">A carregar...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-destructive">Erro ao carregar dados.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">🛡️ Admin Dashboard</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 dark:bg-card/40 bg-card/25">
            <p className="text-muted-foreground text-sm mb-2">👥 Total Users</p>
            <p className="text-4xl font-bold text-primary">{stats.totalUsers}</p>
          </Card>

          <Card className="p-6 dark:bg-card/40 bg-card/25">
            <p className="text-muted-foreground text-sm mb-2">🎮 Total Jogos</p>
            <p className="text-4xl font-bold text-primary">{stats.totalGames}</p>
          </Card>

          <Card className="p-6 dark:bg-card/40 bg-card/25">
            <p className="text-muted-foreground text-sm mb-2">📅 Jogos Hoje</p>
            <p className="text-4xl font-bold text-primary">{stats.gamesToday}</p>
          </Card>

          <Card className="p-6 dark:bg-card/40 bg-card/25">
            <p className="text-muted-foreground text-sm mb-2">🔥 Ativos (7d)</p>
            <p className="text-4xl font-bold text-primary">{stats.activeUsers7d}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'reports'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            🐛 Reports
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Card className="p-6 dark:bg-card/40 bg-card/25">
            <h2 className="text-2xl font-bold text-foreground mb-4">🎮 Jogos por Modo</h2>
            {stats.gamesByMode && stats.gamesByMode.map(mode => (
              <div key={mode.game_mode} className="flex justify-between py-3 border-b border-border">
                <span className="capitalize text-foreground">{mode.game_mode}</span>
                <span className="font-bold text-primary">{mode.total}</span>
              </div>
            ))}
          </Card>
        )}

        {activeTab === 'users' && (
          <Card className="p-6 dark:bg-card/40 bg-card/25">
            <h2 className="text-2xl font-bold text-foreground mb-4">👥 Users Registados</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-foreground">#</th>
                    <th className="text-left py-3 text-foreground">Username</th>
                    <th className="text-left py-3 text-foreground">Data Registo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.allUsers && stats.allUsers.map((user, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/20">
                      <td className="py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 font-semibold text-foreground">{user.username}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('pt-PT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'reports' && (
          <Card className="p-6 dark:bg-card/40 bg-card/25">
            <h2 className="text-2xl font-bold text-foreground mb-4">🐛 Bug Reports & Sugestões</h2>
            <div className="space-y-4">
              {stats.bugReports && stats.bugReports.length > 0 ? (
                stats.bugReports.map((report, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg hover:bg-muted/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          report.type === 'bug' 
                            ? 'bg-destructive/20 text-destructive' 
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {report.type === 'bug' ? '🐛 Bug' : '💡 Sugestão'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          por <span className="font-semibold text-foreground">{report.username}</span>
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                    <p className="text-foreground">{report.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem reports ainda 🎉</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Admin;