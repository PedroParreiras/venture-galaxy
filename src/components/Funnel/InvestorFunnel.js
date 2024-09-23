// src/components/Funnel/InvestorFunnel.js
import React from 'react';
import './InvestorFunnel.css';
import { Link } from 'react-router-dom';

function InvestorFunnel({ companies, preferences }) {
  if (!preferences) {
    return <div>Carregando preferências...</div>;
  }

  // Função para calcular o nível de match
  const calculateMatch = (company) => {
    let matchScore = 0;

    if (preferences.sector === company.sector) {
      matchScore += 50;
    }

    if (company.fundingNeeded <= preferences.dryPowder) {
      matchScore += 50;
    }

    return matchScore;
  };

  // Adicionar o campo matchScore a cada empresa
  const companiesWithMatch = companies.map(company => ({
    ...company,
    matchScore: calculateMatch(company),
  }));

  // Ordenar empresas pelo matchScore
  const sortedCompanies = companiesWithMatch.sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="investor-funnel">
      {sortedCompanies.map(company => (
        <div key={company.id} className="funnel-stage">
          <h3>{company.name} - Match: {company.matchScore}%</h3>
          <p>Setor: {company.sector}</p>
          <p>Valor de Captação: {company.fundingNeeded}</p>
          <Link to={`/company/${company.id}`}>Ver detalhes</Link>
        </div>
      ))}
    </div>
  );
}

export default InvestorFunnel;
