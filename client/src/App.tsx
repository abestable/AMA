import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import api from './services/api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

const Dashboard: React.FC<{ user: User; onLogout: () => Promise<void> }> = ({ user, onLogout }) => {
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 data-testid="dashboard-title" style={{ margin: 0 }}>Dashboard</h1>
        <div data-testid="user-menu" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{user.username} ({user.role})</span>
          <button data-testid="logout-button" onClick={onLogout} style={{ padding: '6px 12px' }}>Logout</button>
        </div>
      </header>

      <section style={{ marginTop: 24 }}>
        <p>Welcome, {user.firstName || user.username}!</p>
      </section>
    </div>
  );
};

const LoginPage: React.FC<{ onLogin: (user: User) => void; onSwitchToRegister: () => void }> = ({ onLogin, onSwitchToRegister }) => {
  return (
    <div style={{ padding: 24 }}>
      <LoginForm onLoginSuccess={onLogin} onSwitchToRegister={onSwitchToRegister} />
    </div>
  );
};

const RegisterPage: React.FC<{ onRegisterSuccess: (message: string) => void; onSwitchToLogin: () => void }> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  return (
    <div style={{ padding: 24 }}>
      <RegisterForm onRegisterSuccess={onRegisterSuccess} onSwitchToLogin={onSwitchToLogin} />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Hydrate from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    navigate('/');
  };

  const handleRegisterSuccess = (_message: string) => {
    // Stay on register page to satisfy tests expecting a visible success message
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={<LoginPage onLogin={handleLogin} onSwitchToRegister={() => navigate('/register')} />}
      />
      <Route
        path="/register"
        element={<RegisterPage onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => navigate('/login')} />}
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;


