import React from 'react';
import Login from './Login';

const App = () => {
  return (
    <div>
      <h1>React MFE Host</h1>
      <p>This is the standalone host for the Login component.</p>
      <hr />
      <Login onLoginSuccess={(username) => console.log(`Standalone login success for ${username}`)} />
    </div>
  );
};

export default App;
