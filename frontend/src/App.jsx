import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import StatsQuiz from './pages/StatsQuiz';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLogin={handleLogin}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(prev => !prev)}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz token={token} user={user} onLogin={handleLogin} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/stats-quiz" element={<StatsQuiz token={token} user={user} onLogin={handleLogin} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;