// src/components/Auth/Logout.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const { logout } = useAuth();
  const history = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      history.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Sair
    </button>
  );
}

export default Logout;
