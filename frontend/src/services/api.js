import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// buscar pergunta aleatória
export const getQuestion = async (difficulty) => {
    const response = await axios.get(`${API_URL}/question`, {
        params: { difficulty }
    });
    return response.data;
};

// registar utilizador
export const register = async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        password
    });
    return response.data;
};

// login
export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
    });
    return response.data;
};

// guardar pontuação (requer token)
export const saveScore = async (score, difficulty, token) => {
    const response = await axios.post(
        `${API_URL}/leaderboard`,
        { score, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// buscar leaderboard
export const getLeaderboard = async (difficulty) => {
    const response = await axios.get(`${API_URL}/leaderboard`, {
        params: { difficulty }
    });
    return response.data;
};