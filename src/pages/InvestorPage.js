// src/pages/InvestorPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './InvestorPage.css';

function InvestorPage() {
  const { currentUser } = useAuth();

  return (
    <div className="investor-page">
      <header className="investor-header">
        <h1>Bem-vindo, {currentUser.email}</h1>
        <nav>
          <Link to="/investor-dashboard">Dashboard</Link>
          <Link to="/logout">Sair</Link>
        </nav>
      </header>
      <main className="investor-main">
        {/* Conteúdo específico para investidores */}
        <h2>Funil de Empresas</h2>
        {/* Visualização do funil */}
      </main>
    </div>
  );
}

export default InvestorPage;
