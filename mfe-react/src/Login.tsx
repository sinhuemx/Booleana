import React, { useState } from 'react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Login attempt:', { username, password });
    // In a real application, you would send these credentials to a backend for authentication.
    // For now, we'll just simulate a successful login.
    alert('Login successful! (Simulated)');
    // You might want to emit an event here to notify the host (Angular) application
    // that the login was successful and pass user data.
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

export function mount(element: HTMLElement) {
  const root = (window as any).ReactDOM.createRoot(element);
  root.render(<Login />);
}
