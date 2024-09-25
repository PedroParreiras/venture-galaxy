// src/components/CompanyCard/CompanyCard.js
import React from 'react';
import './CompanyCard.css';

function CompanyCard({ company }) {
  return (
    <div className="company-card">
      {/* Logo da Empresa */}
      <div className="company-logo-container">
        {company.logoURL ? (
          <img src={company.logoURL} alt={`${company.name} Logo`} className="company-logo" />
        ) : (
          <div className="company-logo-placeholder">Logo</div>
        )}
      </div>

      {/* Informações da Empresa */}
      <div className="company-info">
        <h3 className="company-name">{company.name}</h3>
        <p className="company-sector"><strong>Setor:</strong> {company.sector}</p>
        <p className="company-funding"><strong>Funding Needed:</strong> R$ {company.fundingNeeded.toLocaleString()}</p>
        <p className="company-employees"><strong>Número de Funcionários:</strong> {company.employees}</p>
        <p className="company-creation-date"><strong>Data de Criação:</strong> {new Date(company.creationDate).toLocaleDateString()}</p>
        <p className="company-founder-share"><strong>Porcentagem na Mão de Fundadores:</strong> {company.founderShare}%</p>
        <p className="company-annual-revenue"><strong>Receita Anual:</strong> R$ {company.annualRevenue.toLocaleString()}</p>
        <p className="company-valuation"><strong>Valuation Atual:</strong> R$ {company.valuation.toLocaleString()}</p>
        <p className="company-stage"><strong>Estágio:</strong> {company.stage}</p>
        {company.pitchURL && (
          <p className="company-pitch">
            <strong>Pitch:</strong>{' '}
            <a href={company.pitchURL} target="_blank" rel="noopener noreferrer">
              Visualizar Pitch
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default CompanyCard;
