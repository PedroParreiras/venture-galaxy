// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
// Importando os ícones do Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faRocket, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

function HomePage() {
  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="logo">Venture Galaxy</div>
        <div className="nav-links">
          <Link to="/signup" className="nav-button">
            Cadastre-se
          </Link>
          <Link to="/login" className="nav-button">
            Login
          </Link>
        </div>
      </nav>
      <header className="hero-section">
        <div className="hero-content">
          <h1>Conectando Fundadores e Investidores</h1>
          <p>
            A plataforma ideal para conectar startups e investidores.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">
              Cadastre-se Agora
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Já Tenho Conta
            </Link>
          </div>
        </div>
      </header>
      <main className="features-section">
        <h2>O que é o Venture Galaxy?</h2>
        <div className="features">
          <div className="feature">
            <FontAwesomeIcon icon={faUsers} className="feature-icon" />
            <h3>Rede de Investidores</h3>
            <p>
              Conecte-se com uma ampla rede de investidores em busca de oportunidades.
            </p>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faRocket} className="feature-icon" />
            <h3>Crescimento Acelerado</h3>
            <p>
              Impulsione suas conexões de startups e investidores.
            </p>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faShieldAlt} className="feature-icon" />
            <h3>Segurança</h3>
            <p>
              Ambiente seguro para compartilhamento de informações confidenciais.
            </p>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Venture Galaxy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default HomePage;
