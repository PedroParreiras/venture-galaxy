// src/components/Forms/CompanyForm.js
import React, { useState } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './CompanyForm.css';

function CompanyForm({ companyId, existingData }) {
  const [companyName, setCompanyName] = useState(existingData ? existingData.name : '');
  const [sector, setSector] = useState(existingData ? existingData.sector : '');
  const [fundingNeeded, setFundingNeeded] = useState(existingData ? existingData.fundingNeeded : '');
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const companyData = {
      name: companyName,
      sector,
      fundingNeeded: parseFloat(fundingNeeded),
      founders: existingData ? existingData.founders : [currentUser.uid],
      allowedEditors: existingData ? existingData.allowedEditors : [currentUser.uid],
    };

    try {
      if (companyId) {
        // Atualizar empresa existente
        await db.collection('companies').doc(companyId).update(companyData);
      } else {
        // Criar nova empresa
        await db.collection('companies').add(companyData);
      }
      alert('Empresa salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar a empresa:', error);
      alert('Erro ao salvar a empresa.');
    }
  };

  return (
    <div className="company-form">
      <h2>{companyId ? 'Editar Empresa' : 'Nova Empresa'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome da Empresa:</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        <label>Setor:</label>
        <input
          type="text"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          required
        />

        <label>Valor de Captação Necessário:</label>
        <input
          type="number"
          value={fundingNeeded}
          onChange={(e) => setFundingNeeded(e.target.value)}
          required
        />

        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}

export default CompanyForm;
