import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./shared/components/Navbar";
import Footer from "./shared/components/Footer";
import Loading from "./shared/components/Loading";
import Admin from './pages/Admin';

const Landing = lazy(() => import("./features/landing/Landing"));
const Quiz = lazy(() => import("./features/quiz/Quiz"));
const Leaderboard = lazy(() => import("./features/leaderboard/Leaderboard"));
const StatsQuiz = lazy(() => import("./features/stats-quiz/StatsQuiz"));
const Login = lazy(() => import("./features/auth/Login"));
const BugReport = lazy(() => import("./features/bug-report/BugReport"));

function PageTransition({ children }) {
  const location = useLocation();
  const [prevPath, setPrevPath] = useState("/");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPrevPath(location.pathname);
  }, [location.pathname]);

  const getTransitionClass = () => {
    const current = location.pathname;
    const prev = prevPath;

    if (current === "/" && prev !== "/") {
      return "animate-in fade-in slide-in-from-left duration-500";
    }

    if (prev === "/" && current !== "/") {
      return "animate-in fade-in slide-in-from-right duration-500";
    }

    return "animate-in fade-in duration-500";
  };

  return (
    <div key={location.pathname} className={getTransitionClass()}>
      {children}
    </div>
  );
}

function AppContent({ token, user, darkMode, handleLogin, handleLogout, setDarkMode }) {
  const location = useLocation();
  const hideNavAndFooter =
    location.pathname === "/leaderboard" ||
    location.pathname === "/login" ||
    location.pathname === "/quiz" ||
    location.pathname === "/stats-quiz" ||
    location.pathname === "/bug-report";

  return (
    <>
      <div id="app-background" className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-[3px] scale-110 -z-10" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black/10 dark:bg-black/50" />
      {!hideNavAndFooter && (
        <Navbar user={user} onLogout={handleLogout} darkMode={darkMode} onToggleDark={() => setDarkMode((prev) => !prev)} />
      )}
      <main className="flex-1" id="main-content">
        <PageTransition>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/quiz" element={<Quiz token={token} user={user} onLogin={handleLogin} />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/stats-quiz" element={<StatsQuiz token={token} user={user} onLogin={handleLogin} />} />
              <Route path="/bug-report" element={<BugReport />} />
              <Route path="/admin" element={<Admin token={token} />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}

function App() {
  const { t } = useTranslation();
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    console.log('APP MOUNTED');
    console.log('Token:', token ? 'EXISTS' : 'NULL');
    console.log('User:', user ? user.username : 'NULL');
  }, [token, user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
    const img = darkMode ? "/images/dark_background.png" : "/images/light_background.png";
    const bg = document.getElementById("app-background");
    if (bg) {
      bg.style.backgroundImage = `url('${img}')`;
    }
  }, [darkMode]);

  const handleLogin = (newToken, newUser) => {
    console.log('LOGIN:', newUser.username);
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only fixed top-4 left-4 z-[9999] rounded-lg">
        {t("common.skipToContent")}
      </a>
      <div className="flex flex-col min-h-screen">
        <AppContent token={token} user={user} darkMode={darkMode} handleLogin={handleLogin} handleLogout={handleLogout} setDarkMode={setDarkMode} />
      </div>
    </BrowserRouter>
  );
}

export default App;