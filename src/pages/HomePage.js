// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faRocket,
  faShieldAlt,
  faPiggyBank,
  faChartLine,
  faMoneyCheckAlt,
  faBuilding,
  faBriefcase,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function HomePage() {
  const [stats, setStats] = useState({
    totalDryPowder: 0,
    totalAUM: 0,
    totalInvestors: 0,
    totalValuations: 0,
    totalStartups: 0,
    totalEmployees: 0,
  });

  const animateCount = (start, end, duration, setter) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setter(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch investors data
        const investorsSnap = await getDocs(collection(db, 'investors'));
        const investorsData = investorsSnap.docs.map((doc) => doc.data());

        // Fetch companies data
        const companiesSnap = await getDocs(collection(db, 'companies'));
        const companiesData = companiesSnap.docs.map((doc) => doc.data());

        // Calculate sums
        const totalDryPowder = investorsData.reduce(
          (acc, investor) => acc + (investor.dryPowder || 0),
          0
        );
        const totalAUM = investorsData.reduce((acc, investor) => acc + (investor.aum || 0), 0);
        const totalValuations = companiesData.reduce(
          (acc, company) => acc + (company.valuation || 0),
          0
        );
        const totalEmployees = companiesData.reduce(
          (acc, company) => acc + (company.employees || 0),
          0
        );
        const totalInvestors = investorsData.length;
        const totalStartups = companiesData.length;

        // Animate numbers from 0 to total over 3 seconds
        animateCount(0, totalDryPowder, 3000, (value) =>
          setStats((prev) => ({ ...prev, totalDryPowder: value }))
        );
        animateCount(0, totalAUM, 3000, (value) =>
          setStats((prev) => ({ ...prev, totalAUM: value }))
        );
        animateCount(0, totalValuations, 3000, (value) =>
          setStats((prev) => ({ ...prev, totalValuations: value }))
        );
        animateCount(0, totalInvestors, 3000, (value) =>
          setStats((prev) => ({ ...prev, totalInvestors: value }))
        );
        animateCount(0, totalStartups, 3000, (value) =>
          setStats((prev) => ({ ...prev, totalStartups: value }))
        );
        animateCount(0, totalEmployees, 3000, (value) =>
          setStats((prev) => ({ ...prev, totalEmployees: value }))
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="homepage">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Conectando Fundadores e Investidores</h1>
          <p>A plataforma ideal para conectar startups e investidores.</p>
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
            <p>Conecte-se com uma ampla rede de investidores em busca de oportunidades.</p>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faRocket} className="feature-icon" />
            <h3>Crescimento Acelerado</h3>
            <p>Impulsione suas conexões entre startups e investidores.</p>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faShieldAlt} className="feature-icon" />
            <h3>Segurança</h3>
            <p>Ambiente seguro para compartilhamento de informações confidenciais.</p>
          </div>
        </div>

        {/* Displaying statistics */}
        <div className="stats-section">
          <h2>Números do Venture Galaxy</h2>
          <div className="stats">
            <div className="stats-column">
              <div className="stat-item">
                <FontAwesomeIcon icon={faPiggyBank} className="stat-icon" />
                <h3>Total Dry Powder</h3>
                <p>R$ {stats.totalDryPowder.toLocaleString()}</p>
              </div>
              <div className="stat-item">
                <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
                <h3>Ativos sob Gestão (AUM)</h3>
                <p>R$ {stats.totalAUM.toLocaleString()}</p>
              </div>
              <div className="stat-item">
                <FontAwesomeIcon icon={faBriefcase} className="stat-icon" />
                <h3>Total de Investidores</h3>
                <p>{stats.totalInvestors.toLocaleString()}</p>
              </div>
            </div>
            <div className="stats-column">
            <div className="stat-item">
                <FontAwesomeIcon icon={faUserTie} className="stat-icon" />
                <h3>Total de Funcionários</h3>
                <p>{stats.totalEmployees.toLocaleString()}</p>
              </div>
              <div className="stat-item">
                <FontAwesomeIcon icon={faMoneyCheckAlt} className="stat-icon" />
                <h3>Total de Valuation</h3>
                <p>R$ {stats.totalValuations.toLocaleString()}</p>
              </div>
              <div className="stat-item">
                <FontAwesomeIcon icon={faBuilding} className="stat-icon" />
                <h3>Total de Startups</h3>
                <p>{stats.totalStartups.toLocaleString()}</p>
              </div>
            </div>
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
