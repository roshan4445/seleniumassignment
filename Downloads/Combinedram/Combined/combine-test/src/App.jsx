const App = () => {
  return (
    <div>
      <button onClick={() => {
        window.location.href = 'http://localhost:5176/login';
      }}>
        User
      </button>
      
      <button onClick={() => {
        window.location.href = 'http://localhost:5175/login';
      }}>
        Admin
      </button>
    </div>
  );
}

export default App;
