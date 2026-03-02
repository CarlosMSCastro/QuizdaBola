import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// buscar competições
export const getCompetitions = async () => {
    const res = await axios.get(`${API_URL}/api/competitions`);
    return res.data;
};

// buscar competição específica
export const getCompetition = async (competitionId) => {
    const res = await axios.get(`${API_URL}/api/competitions/${competitionId}`);
    return res.data;
};

// buscar pergunta para o jogo de stats
export const getStatsQuestion = async (excludeIds = [], competitionId = 'ligaportugal2024') => {
    const res = await axios.get(`${API_URL}/api/stats-quiz`, {
        params: { 
            exclude: excludeIds.join(','),
            competition_id: competitionId
        }
    });
    return res.data;
};

// buscar pergunta aleatória (com exclusão de IDs)
export const getQuestion = async (excludeIds = [], competitionId = 'ligaportugal2024') => {
    const response = await axios.get(`${API_URL}/api/question`, {
        params: { 
            exclude: excludeIds.join(','),
            competition_id: competitionId
        }
    });
    return response.data;
};

// registar utilizador
export const register = async (username, password) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password
    });
    return response.data;
};

// login
export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
    });
    return response.data;
};

// guardar pontuação (requer token)
export const saveScore = async (score, game_mode, token, competitionId = 'ligaportugal2024') => {
    const res = await axios.post(`${API_URL}/api/leaderboard`,
        { 
            score, 
            game_mode, 
            competition_id: competitionId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
};

// buscar leaderboard
export const getLeaderboard = async (game_mode, competitionId = null) => {
    const params = { game_mode };
    
    if (competitionId && competitionId !== 'global') {
        params.competition_id = competitionId;
    }
    
    const res = await axios.get(`${API_URL}/api/leaderboard`, { params });
    return res.data;
};

// enviar bug report
export const sendBugReport = async (message, page, userAgent, username = 'guest') => {
    const res = await axios.post(`${API_URL}/api/bug-report`, {
        message,
        page,
        user_agent: userAgent,
        username
    });
    return res.data;
};