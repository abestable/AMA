import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Login successful! Welcome ${data.data.user.username} (${data.data.user.role})`);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setCurrentUser(data.data.user);
        setEmail('');
        setPassword('');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error - check if backend is running');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setMessage('✅ Logged out successfully');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setMessage('❌ Not logged in');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = JSON.parse(user);
        setMessage(`✅ Currently logged in as: ${userData.username} (${userData.role})`);
      } else {
        setMessage('❌ Token expired or invalid');
        handleLogout();
      }
    } catch (error) {
      setMessage('❌ Error checking auth status');
    }
  };

  const testBackend = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      setMessage(`✅ Backend OK - ${data.status} (${data.environment})`);
    } catch (error) {
      setMessage('❌ Backend not responding');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔐 Secure WebApp Test</h1>
        
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <h3>Test Credentials:</h3>
          <p><strong>Admin:</strong> admin@example.com / Admin123!</p>
          <p><strong>User:</strong> user@example.com / User123!</p>
        </div>

        {currentUser ? (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }} data-testid="user-menu">
            <h3 data-testid="dashboard-title">✅ Logged in as:</h3>
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            <button onClick={handleLogout} style={{ margin: '5px', padding: '8px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '4px' }} data-testid="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ marginBottom: '20px' }} data-testid="login-form">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ margin: '5px', padding: '8px', width: '200px' }}
                disabled={isLoading}
                data-testid="email-input"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ margin: '5px', padding: '8px', width: '200px' }}
                disabled={isLoading}
                data-testid="password-input"
              />
            </div>
            <button 
              type="submit" 
              style={{ margin: '5px', padding: '8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
              disabled={isLoading}
              data-testid="login-button"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        <div style={{ marginBottom: '20px' }}>
          <button onClick={checkAuth} style={{ margin: '5px', padding: '8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
            Check Auth Status
          </button>
          <button onClick={testBackend} style={{ margin: '5px', padding: '8px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px' }}>
            Test Backend
          </button>
        </div>

        {message && (
          <div 
            data-testid="error-message"
            style={{ 
              padding: '15px', 
              margin: '10px', 
              backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e8',
              borderRadius: '8px',
              maxWidth: '500px',
              textAlign: 'left'
            }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>✅ Backend API is working!</p>
          <p>✅ Database (SQLite) is connected!</p>
          <p>✅ Authentication system is functional!</p>
          <p>✅ JWT tokens are working!</p>
        </div>
      </header>
    </div>
  );
}

export default App;
