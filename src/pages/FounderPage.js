// src/pages/FounderPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './FounderPage.css';

function FounderPage() {
  const { currentUser } = useAuth();

  return (
    <div className="founder-page">
      <header className="founder-header">
        <h1>Bem-vindo, {currentUser.email}</h1>
        <nav>
          <Link to="/founder-dashboard">Dashboard</Link>
          <Link to="/company-form">Criar Empresa</Link>
          <Link to="/logout">Sair</Link>
        </nav>
      </header>
      <main className="founder-main">
        {/* Conteúdo específico para fundadores */}
        <h2>Suas Empresas</h2>
        {/* Listagem de empresas do fundador */}
      </main>
    </div>
  );
}

export default FounderPage;
