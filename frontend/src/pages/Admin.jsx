import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../shared/services/api';
import { Card } from '@/shared/components/ui/card';

function Admin({ token }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Admin useEffect - token:', token ? 'EXISTS' : 'MISSING');
    
    if (!token) {
      console.log('❌ No token, redirecting to /');
      navigate('/');
      return;
    }

    // VERIFICAR SE É ADMIN
    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;
    
    if (userData?.username !== 'CarlosCastro') {
      console.log('❌ Not admin user:', userData?.username);
      navigate('/');
      return;
    }

    console.log('✅ Admin verified, fetching stats...');

    const fetchStats = async () => {
      try {
        console.log('📡 Calling getStats with token:', token.substring(0, 20) + '...');
        const data = await getStats(token);
        console.log('✅ Stats received:', data);
        setStats(data);
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        console.error('❌ Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">A carregar...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">Erro ao carregar dados. Verifica a consola.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Users</p>
            <p className="text-4xl font-bold text-primary">{stats.totalUsers}</p>
          </Card>

          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Jogos</p>
            <p className="text-4xl font-bold text-primary">{stats.totalGames}</p>
          </Card>

          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Jogos Hoje</p>
            <p className="text-4xl font-bold text-primary">{stats.gamesToday}</p>
          </Card>

          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Score Medio</p>
            <p className="text-4xl font-bold text-primary">{stats.avgScore}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Jogos por Modo</h2>
            {stats.gamesByMode && stats.gamesByMode.map(mode => (
              <div key={mode.game_mode} className="flex justify-between py-2 border-b">
                <span className="capitalize">{mode.game_mode}</span>
                <span className="font-bold">{mode.total}</span>
              </div>
            ))}
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Users Ativos (7 dias)</h2>
            <p className="text-6xl font-bold text-primary text-center py-8">
              {stats.activeUsers7d}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Top 10 Scores</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-left py-2">Username</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Modo</th>
                  <th className="text-left py-2">Liga</th>
                  <th className="text-left py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats.topScores && stats.topScores.map((score, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">#{idx + 1}</td>
                    <td className="py-2 font-semibold">{score.username}</td>
                    <td className="py-2 text-primary font-bold">{score.score}</td>
                    <td className="py-2 capitalize">{score.game_mode}</td>
                    <td className="py-2">{score.competition_id}</td>
                    <td className="py-2 text-sm text-muted-foreground">
                      {new Date(score.created_at).toLocaleDateString('pt-PT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
          >
            Voltar ao Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;