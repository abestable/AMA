import React, { useState } from 'react';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

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
        onLoginSuccess(data.data.user);
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

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 data-testid="login-title">Login</h2>
      <form onSubmit={handleLogin} data-testid="login-form" noValidate>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={isLoading}
            data-testid="email-input"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={isLoading}
            data-testid="password-input"
          />
        </div>
        <button 
          type="submit" 
          style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', marginBottom: '10px' }}
          disabled={isLoading}
          data-testid="login-button"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <button 
            type="button"
            onClick={onSwitchToRegister}
            style={{ background: 'none', border: 'none', color: '#2196F3', textDecoration: 'underline', cursor: 'pointer' }}
            data-testid="switch-to-register-button"
          >
            Don't have an account? Register
          </button>
        </div>
      </form>

      {message && (
        <div 
          data-testid="login-error-message"
          style={{ padding: '10px', marginTop: '10px', backgroundColor: message.includes('❌') ? '#ffebee' : '#e8f5e8', borderRadius: '4px', fontSize: '14px' }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        <p><strong>Test Credentials:</strong></p>
        <p>Admin: admin@example.com / Admin123!</p>
        <p>User: user@example.com / User123!</p>
      </div>
    </div>
  );
};
