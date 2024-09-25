// src/components/EntityCard/EntityCard.js
import React from 'react';
import './EntityCard.css';

function EntityCard({ entity, onEdit }) {
  return (
    <div className="entity-card">
      {/* Logo da Entidade */}
      <div className="entity-logo-container">
        {entity.logoURL ? (
          <img src={entity.logoURL} alt={`${entity.name} Logo`} className="entity-logo" />
        ) : (
          <div className="entity-logo-placeholder">Logo</div>
        )}
      </div>

      {/* Informações da Entidade */}
      <div className="entity-info">
        <h3 className="entity-name">{entity.name}</h3>
        <p className="entity-sector"><strong>Setores de Interesse:</strong> {entity.sectorInterest.join(', ')}</p>
        <p className="entity-aum"><strong>AUM:</strong> R$ {entity.aum.toLocaleString()}</p>
        <p className="entity-ticket-size"><strong>Tamanho do Ticket:</strong> R$ {entity.ticketSize.toLocaleString()}</p>
        <p className="entity-dry-powder"><strong>Dry Powder:</strong> R$ {entity.dryPowder.toLocaleString()}</p>
        <p className="entity-preferred-stage"><strong>Estágio Preferido:</strong> {entity.preferredStage}</p>
        <p className="entity-preferred-revenue"><strong>Receita Anual Preferida:</strong> R$ {entity.preferredRevenue.toLocaleString()}</p>
        <p className="entity-preferred-valuation"><strong>Valuation Preferido:</strong> R$ {entity.preferredValuation.toLocaleString()}</p>
        <button className="edit-button" onClick={onEdit}>Editar</button>
      </div>
    </div>
  );
}

export default EntityCard;
