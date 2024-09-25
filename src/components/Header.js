// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css'; // Usaremos o mesmo estilo da HomePage.css

function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redireciona para a Home após o logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">Venture Galaxy</div>
      <div className="nav-links">
        {currentUser ? (
          <>
            <Link to="/" className="nav-button">
              Home
            </Link>
            <Link to="/dashboard" className="nav-button">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="nav-button logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="nav-button">
              Cadastre-se
            </Link>
            <Link to="/login" className="nav-button">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Header;
