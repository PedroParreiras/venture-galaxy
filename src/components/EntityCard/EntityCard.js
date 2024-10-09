import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './EntityCard.css';
import { useAuth } from '../../contexts/AuthContext';
import EntityForm from '../Forms/EntityForm'; // Import the EntityForm component

function EntityCard({ entity, onEntityUpdate }) {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false); // This state controls whether to show the form or not

  useEffect(() => {
    // Log when the card is rendered and check if user is authorized
    console.log('EntityCard rendered for entity:', entity.name);
    if (entity.allowedEditors?.includes(currentUser?.uid)) {
      console.log('Current user is authorized to edit:', currentUser?.uid);
    } else {
      console.log('Current user is not authorized to edit');
    }
  }, [entity, currentUser]); // Only run this effect when the entity or currentUser changes

  // Handler when the form is successfully submitted
  const handleFormSubmit = (updatedEntity) => {
    console.log('Form submitted with updated entity data:', updatedEntity);
    setShowForm(false); // Close the form and return to the card view after submission
    if (onEntityUpdate) {
      onEntityUpdate(updatedEntity); // Notify parent component of updates
    }
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    console.log('Form editing canceled');
    setShowForm(false); // Return to the card view without changes
  };

  // Log when the "Edit" button is clicked
  const handleEditClick = () => {
    console.log('Edit button clicked, showing form');
    setShowForm(true);
  };

  // If `showForm` is true, render the form only and prevent the card from being shown
  if (showForm) {
    console.log('Rendering EntityForm for entity:', entity.name);
    return (
      <div className="entity-form-wrapper">
        <EntityForm
          entity={entity} // Pass the entity data to pre-fill the form
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  // If `showForm` is false, render the card as normal
  console.log('Rendering EntityCard for entity:', entity.name);
  return (
    <div className="entity-card-wrapper">
      <div className="entity-card">
        {/* Logo Section */}
        <div className="entity-logo-container">
          {entity.logoURL ? (
            <img
              src={entity.logoURL}
              alt={`${entity.name} Logo`}
              className="entity-logo"
            />
          ) : (
            <div className="entity-logo-placeholder">Logo</div>
          )}
        </div>

        {/* Information Section */}
        <div className="entity-info">
          <h3 className="entity-name">{entity.name}</h3>
          
          {/* Website Link */}
          {entity.website && (
            <p><strong>Website:</strong> <a href={entity.website} target="_blank" rel="noopener noreferrer">{entity.website}</a></p>
          )}
          
          <p><strong>Setores de Interesse:</strong> {entity.sectorInterest.join(', ')}</p>
          <p><strong>AUM:</strong> R$ {entity.aum.toLocaleString()}</p>
          <p><strong>Tamanho do Ticket:</strong> R$ {entity.ticketSize.toLocaleString()}</p>
          <p><strong>Dry Powder:</strong> R$ {entity.dryPowder.toLocaleString()}</p>
          <p><strong>Estágio Preferido:</strong> {entity.preferredStage}</p>
          <p><strong>Receita Anual Preferida:</strong> R$ {entity.preferredRevenue.toLocaleString()}</p>
          <p><strong>Valuation Preferido:</strong> R$ {entity.preferredValuation.toLocaleString()}</p>
          {entity.response && (
            <p><strong>Resposta:</strong> {entity.response}</p>
          )}

          {/* "Edit" Button */}
          {entity.allowedEditors?.includes(currentUser?.uid) && (
            <button
              className="edit-button"
              onClick={handleEditClick} // Switch to form view
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

EntityCard.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    sectorInterest: PropTypes.arrayOf(PropTypes.string).isRequired,
    aum: PropTypes.number.isRequired,
    ticketSize: PropTypes.number.isRequired,
    dryPowder: PropTypes.number.isRequired,
    preferredStage: PropTypes.string.isRequired,
    preferredRevenue: PropTypes.number.isRequired,
    preferredValuation: PropTypes.number.isRequired,
    logoURL: PropTypes.string,
    website: PropTypes.string, // Added website
    allowedEditors: PropTypes.arrayOf(PropTypes.string).isRequired,
    response: PropTypes.string,
  }).isRequired,
  onEntityUpdate: PropTypes.func,
};

export default EntityCard;
