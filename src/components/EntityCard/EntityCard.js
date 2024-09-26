// src/components/EntityCard/EntityCard.js
import React, { useState } from 'react';
import './EntityCard.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

function EntityCard({ entity }) {
  const { currentUser } = useAuth();

  // States to control editing of each field
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');
  const [sectorOptions] = useState([
    'Agnostic', 'Adtech', 'Agtech', 'Biotech', 'Cannabis', 'Cibersecurity', 'Cleantech',
    'Construtech', 'Datatech', 'Deeptech', 'Ecommerce', 'Edtech', 'Energytech', 'ESG',
    'Femtech', 'Fintech', 'Foodtech', 'Games', 'Govtech', 'Healthtech', 'HRtech', 'Indtech',
    'Insurtech', 'Legaltech', 'Logtech', 'MarketPlaces', 'Martech', 'Nanotech', 'Proptech',
    'Regtech', 'Retailtech', 'Socialtech', 'Software', 'Sporttech', 'Web3', 'Space'
  ]);
  const [selectedSectors, setSelectedSectors] = useState(
    Array.isArray(entity.sectorInterest)
      ? entity.sectorInterest
      : entity.sectorInterest
      ? [entity.sectorInterest]
      : []
  );

  // Function to handle sector selection
  const handleSectorChange = (sector) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(item => item !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  // Function to handle field edit submission
  const handleEditSubmit = async (field) => {
    try {
      const docRef = doc(db, 'investors', currentUser.uid);
      const updatedValue = field === 'sectorInterest' ? selectedSectors : parseFloat(fieldValue) || fieldValue;
      await updateDoc(docRef, { [field]: updatedValue });
      setEditingField(null);
      window.location.reload(); // Refresh component after update
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Failed to update the data. Please try again.');
    }
  };

  // Function to render each field with edit capability
  const renderEditableField = (label, field, value, isCurrency = false) => (
    <div className="entity-field">
      <strong>{label}:</strong>
      {editingField === field ? (
        <>
          {field === 'sectorInterest' ? (
            <div className="sector-options">
              {sectorOptions.map(option => (
                <label key={option}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedSectors.includes(option)}
                    onChange={() => handleSectorChange(option)}
                  />
                  {option}
                </label>
              ))}
              <button
                className="submit-button"
                onClick={() => handleEditSubmit(field)}
              >
                Submit
              </button>
            </div>
          ) : (
            <>
              <input
                type={isCurrency ? 'number' : 'text'}
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                autoFocus
              />
              <button
                className="submit-button"
                onClick={() => handleEditSubmit(field)}
              >
                Submit
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <span>{isCurrency ? `R$ ${value.toLocaleString()}` : value}</span>
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
    <div className="entity-card">
      {/* Logo */}
      <div className="entity-logo-container">
        {entity.logoURL ? (
          <img src={entity.logoURL} alt={`${entity.name} Logo`} className="entity-logo" />
        ) : (
          <div className="entity-logo-placeholder">Logo</div>
        )}
      </div>

      {/* Information */}
      <div className="entity-info">
        <h3 className="entity-name">{entity.name}</h3>
        {renderEditableField('Setores de Interesse', 'sectorInterest', selectedSectors.join(', '))}
        {renderEditableField('AUM', 'aum', entity.aum, true)}
        {renderEditableField('Tamanho do Ticket', 'ticketSize', entity.ticketSize, true)}
        {renderEditableField('Dry Powder', 'dryPowder', entity.dryPowder, true)}
        {renderEditableField('Estágio Preferido', 'preferredStage', entity.preferredStage)}
        {renderEditableField('Receita Anual Preferida', 'preferredRevenue', entity.preferredRevenue, true)}
        {renderEditableField('Valuation Preferido', 'preferredValuation', entity.preferredValuation, true)}
      </div>
    </div>
  );
}

export default EntityCard;
