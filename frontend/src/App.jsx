import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import StatsQuiz from './pages/StatsQuiz';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AppContent({ token, user, darkMode, handleLogin, handleLogout, setDarkMode }) {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === '/leaderboard' || location.pathname === '/login';

  return (
    <>
      <div
        id="app-background"
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-[3px] scale-110 -z-10"
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black/10 dark:bg-black/50" />

      {!hideNavAndFooter && (
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(prev => !prev)}
        />
      )}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/quiz" element={<Quiz token={token} user={user} onLogin={handleLogin} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/stats-quiz" element={<StatsQuiz token={token} user={user} onLogin={handleLogin} />} />
        </Routes>
      </main>

      {!hideNavAndFooter && <Footer />}
    </>
  );
}

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

    const img = darkMode ? '/images/dark_background.png' : '/images/light_background.png';
    const bg = document.getElementById('app-background');
    if (bg) {
      bg.style.backgroundImage = `url('${img}')`;
    }
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
      <div className="flex flex-col min-h-screen">
        <AppContent 
          token={token}
          user={user}
          darkMode={darkMode}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          setDarkMode={setDarkMode}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;