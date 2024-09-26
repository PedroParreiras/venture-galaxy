// src/components/CompanyCard/CompanyCard.js

import React, { useState } from 'react';
import './CompanyCard.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

function CompanyCard({ company }) {
  const { currentUser } = useAuth();

  // States to control editing of each field
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');

  const sectorOptions = [
    'Agnostic', 'Adtech', 'Agtech', 'Biotech', 'Cannabis', 'Cibersecurity', 'Cleantech',
    'Construtech', 'Datatech', 'Deeptech', 'Ecommerce', 'Edtech', 'Energytech', 'ESG',
    'Femtech', 'Fintech', 'Foodtech', 'Games', 'Govtech', 'Healthtech', 'HRtech', 'Indtech',
    'Insurtech', 'Legaltech', 'Logtech', 'MarketPlaces', 'Martech', 'Nanotech', 'Proptech',
    'Regtech', 'Retailtech', 'Socialtech', 'Software', 'Sporttech', 'Web3', 'Space'
  ];
  const stageOptions = [
    'Aceleração',
    'Anjo',
    'Pre-Seed',
    'Seed',
    'Série A',
    'Série B',
    'Série C',
    'Pre-IPO'
  ];

  // Function to handle field edit submission
  const handleEditSubmit = async (field) => {
    try {
      const docRef = doc(db, 'companies', currentUser.uid);
      let updatedValue;
      if (field === 'creationDate') {
        updatedValue = fieldValue;
      } else if (field === 'sector' || field === 'stage' || field === 'name') {
        updatedValue = fieldValue;
      } else {
        updatedValue = parseFloat(fieldValue) || fieldValue;
      }
      await updateDoc(docRef, { [field]: updatedValue });
      setEditingField(null);
      window.location.reload(); // Refresh component after update
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Failed to update the data. Please try again.');
    }
  };

  // Function to render each field with edit capability
  const renderEditableField = (label, field, value, isCurrency = false, isDate = false, isPercentage = false, options = null) => (
    <div className="company-field">
      <strong>{label}:</strong>
      {editingField === field ? (
        <>
          {options ? (
            <select
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              autoFocus
            >
              <option value="">Selecione</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={isCurrency || isPercentage ? 'number' : isDate ? 'date' : 'text'}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              autoFocus
            />
          )}
          <button
            className="submit-button"
            onClick={() => handleEditSubmit(field)}
          >
            Submit
          </button>
        </>
      ) : (
        <>
          <span>
            {isCurrency ? `R$ ${parseFloat(value).toLocaleString()}` :
             isPercentage ? `${value}%` :
             isDate ? new Date(value).toLocaleDateString() :
             value}
          </span>
          <button
            className="edit-button"
            onClick={() => {
              setEditingField(field);
              setFieldValue(value);
            }}
          >
            Edit
          </button>
        </>
      )}
    </div>
  );

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
        {renderEditableField('Nome da Startup', 'name', company.name)}
        {renderEditableField('Setor de Atuação', 'sector', company.sector, false, false, false, sectorOptions)}
        {renderEditableField('Número de Funcionários', 'employees', company.employees)}
        {renderEditableField('Data de Criação', 'creationDate', company.creationDate, false, true)}
        {renderEditableField('Porcentagem na Mão de Fundadores', 'founderShare', company.founderShare, false, false, true)}
        {renderEditableField('Receita Anual', 'annualRevenue', company.annualRevenue, true)}
        {renderEditableField('Valuation Atual', 'valuation', company.valuation, true)}
        {renderEditableField('Estágio', 'stage', company.stage, false, false, false, stageOptions)}
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
