import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ReservationPage from './ReservationPage';
import AdminPage from './AdminPanel';
import RoomPage from './RoomPage';
import Notification from './Notifications';


function App() {
  const [token, setToken] = React.useState(null);
  const [role, setRole] = React.useState(null);
  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
  }, []);

  React.useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  React.useEffect(() => {
    if (role) {
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('role');
    }
  }, [role]);

  return (
    <Router>
      <div className="App">
        <nav className="bg-indigo-600 text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-6">
            <h1 className="text-xl font-semibold">Viešbučiai</h1>
            
            <div className="space-x-4">
              <Link 
                to="/" 
                className="text-white hover:text-indigo-200 transition duration-300">Pagrindinis</Link>
              {!token ? (
                <>
                  <Link 
                    to="/login" 
                    className="text-white hover:text-indigo-200 transition duration-300">Prisijungti</Link>
                  <Link 
                    to="/register" 
                    className="text-white hover:text-indigo-200 transition duration-300">Registruotis</Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { 
                      setToken(null); 
                      setRole(null); 
                      localStorage.removeItem('token'); 
                      localStorage.removeItem('role'); 
                      window.location.href = '/login';
                    }} 
                    className="text-white hover:text-indigo-200 transition duration-300">Atsijungti</button>
                  <Link 
                    to="/reservations" 
                    className="text-white hover:text-indigo-200 transition duration-300">Rezervacijos
                  </Link>
                  {role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="text-white hover:text-indigo-200 transition duration-300">Administratoriaus puslapis
                    </Link>
                  )}
                  { token && (
                    <Link 
                      to="/notifications" 
                      className="text-white hover:text-indigo-200 transition duration-300">Pranešimai
                    </Link>
                  )
                  }  
                </>
              )}
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-6 py-6">
          <Routes>
            <Route path="/" element={<HomePage token={token} />} />
            <Route path="/login" element={<LoginPage setToken={setToken} setRole={setRole} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reservations" element={<ReservationPage token={token} role={role}/>} />
            <Route path="*" element={<h1>404 - Not Found</h1>} />
            <Route path="/admin" element={<AdminPage token={token} />} />
            <Route path="/notifications" element={<Notification token={token} role={role}/>}/>
            <Route path="/room/:id" element={<RoomPage/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;