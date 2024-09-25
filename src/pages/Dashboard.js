// src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faUserTie, faMoneyBillWave, faCogs } from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Bem-vindo, {currentUser?.email || "Usuário"}!</h1>
        <p>Seu painel personalizado para acompanhar suas atividades no Venture Galaxy.</p>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-stats">
          <div className="stat-card">
            <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
            <h3>Progresso</h3>
            <p>Acompanhe o crescimento de suas conexões e investimentos.</p>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faUserTie} className="stat-icon" />
            <h3>Fundadores Conectados</h3>
            <p>Veja quantos fundadores você já conectou.</p>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faMoneyBillWave} className="stat-icon" />
            <h3>Investimentos Feitos</h3>
            <p>Gerencie seus investimentos de forma fácil e segura.</p>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faCogs} className="stat-icon" />
            <h3>Configurações</h3>
            <p>Ajuste suas preferências e dados da conta.</p>
          </div>
        </div>

        <section className="dashboard-content">
          <h2>Últimas Atualizações</h2>
          <p>Fique por dentro das últimas movimentações no mercado de startups.</p>
          {/* Adicione mais conteúdo relevante, como gráficos ou listas de atividades */}
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Venture Galaxy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
