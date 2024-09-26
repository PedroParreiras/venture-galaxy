// src/components/Forms/EntityForm.js

import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase'; // Importando auth, db e storage
import { useAuth } from '../../contexts/AuthContext';
import './EntityForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import EntityCard from '../EntityCard/EntityCard'; // Importando o EntityCard

function EntityForm() {
  const { currentUser } = useAuth();
  const [entityData, setEntityData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Estados para os campos do formulário
  const [entityName, setEntityName] = useState('');
  const [sectorInterest, setSectorInterest] = useState([]);
  const [aum, setAum] = useState('');
  const [ticketSize, setTicketSize] = useState('');
  const [dryPowder, setDryPowder] = useState('');
  const [preferredStage, setPreferredStage] = useState('');
  const [preferredRevenue, setPreferredRevenue] = useState('');
  const [preferredValuation, setPreferredValuation] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoURL, setLogoURL] = useState('');

  // Opções de Setores de Interesse
  const sectorOptions = [
    'Agnostic', 'Adtech', 'Agtech', 'Biotech', 'Cannabis', 'Cibersecurity', 'Cleantech',
    'Construtech', 'Datatech', 'Deeptech', 'Ecommerce', 'Edtech', 'Energytech', 'ESG',
    'Femtech', 'Fintech', 'Foodtech', 'Games', 'Govtech', 'Healthtech', 'HRtech', 'Indtech',
    'Insurtech', 'Legaltech', 'Logtech', 'MarketPlaces', 'Martech', 'Nanotech', 'Proptech',
    'Regtech', 'Retailtech', 'Socialtech', 'Software', 'Sporttech', 'Web3', 'Space'
  ];

  // Opções de Estágios
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

  // Função para buscar os dados do investidor do Firestore
  useEffect(() => {
    const fetchEntityData = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'investors', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEntityData(data);
            setEntityName(data.name || '');
            setSectorInterest(data.sectorInterest || []);
            setAum(data.aum || '');
            setTicketSize(data.ticketSize || '');
            setDryPowder(data.dryPowder || '');
            setPreferredStage(data.preferredStage || '');
            setPreferredRevenue(data.preferredRevenue || '');
            setPreferredValuation(data.preferredValuation || '');
            setLogoURL(data.logoURL || '');
            setIsFormVisible(false);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do investidor:', error);
        }
      }
    };

    fetchEntityData();
  }, [currentUser]);

  // Função para fazer upload do logo via Serverless Function com Autenticação
  const handleLogoUpload = async () => {
    if (!logo) return '';
    const formData = new FormData();
    formData.append('logo', logo);
    formData.append('userId', currentUser.uid); // Passando o userId como campo

    try {
      const token = await auth.currentUser.getIdToken(); // Obtém o token de autenticação
      const response = await fetch('/api/uploadLogo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload do logo');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedLogoURL = logoURL;

    if (logo) {
      try {
        uploadedLogoURL = await handleLogoUpload();
        setLogoURL(uploadedLogoURL);
      } catch (error) {
        alert('Ocorreu um erro ao fazer upload do logo. Tente novamente.');
        return;
      }
    }

    const data = {
      name: entityName,
      sectorInterest,
      aum: parseFloat(aum),
      ticketSize: parseFloat(ticketSize),
      dryPowder: parseFloat(dryPowder),
      preferredStage,
      preferredRevenue: parseFloat(preferredRevenue),
      preferredValuation: parseFloat(preferredValuation),
      logoURL: uploadedLogoURL || '',
      allowedEditors: [currentUser.uid],
    };

    try {
      await setDoc(doc(db, 'investors', currentUser.uid), data, { merge: true });
      setEntityData(data); // Atualiza o estado com os dados salvos
      setIsFormVisible(false); // Oculta o formulário após o envio
      alert('Informações do investidor salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar as informações do investidor:', error);
      alert('Erro ao salvar as informações.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleEditAgain = () => {
    setIsFormVisible(true); // Mostra o formulário para edição
  };

  return (
    <div className="entity-form-container">
      <div className="entity-form">
        {isFormVisible ? (
          <>
            <h2>{entityData ? 'Editar Informações do Investidor' : 'Nova Entidade de Investimento'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Campo de Upload do Logo */}
              <div className="form-group">
                <label>Logo da Entidade:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {logoURL && (
                  <img src={logoURL} alt="Logo da Entidade" className="preview-image" />
                )}
              </div>

              {/* Campo de Nome da Entidade */}
              <div className="form-group">
                <label>Nome da Entidade:</label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  required
                />
              </div>

              {/* Checkboxes de Setores de Interesse */}
              <div className="form-group">
                <label>Setores de Interesse:</label>
                <div className="checkbox-group">
                  {sectorOptions.map((option) => (
                    <label key={option} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={option}
                        checked={sectorInterest.includes(option)}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          if (checked) {
                            setSectorInterest([...sectorInterest, value]);
                          } else {
                            setSectorInterest(sectorInterest.filter((item) => item !== value));
                          }
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Campo AUM */}
              <div className="form-group">
                <label>Assets Under Management (AUM):</label>
                <input
                  type="number"
                  value={aum}
                  onChange={(e) => setAum(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Campo Tamanho do Ticket */}
              <div className="form-group">
                <label>Most Common Ticket Size:</label>
                <input
                  type="number"
                  value={ticketSize}
                  onChange={(e) => setTicketSize(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Campo Dry Powder */}
              <div className="form-group">
                <label>Dry Powder:</label>
                <input
                  type="number"
                  value={dryPowder}
                  onChange={(e) => setDryPowder(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Campo Estágio Preferido da Empresa */}
              <div className="form-group">
                <label>Estágio Preferido da Empresa:</label>
                <select
                  value={preferredStage}
                  onChange={(e) => setPreferredStage(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {stageOptions.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo Receita Anual Preferida */}
              <div className="form-group">
                <label>Receita Anual Preferida:</label>
                <input
                  type="number"
                  value={preferredRevenue}
                  onChange={(e) => setPreferredRevenue(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Campo Valuation Preferido */}
              <div className="form-group">
                <label>Valuation Preferido:</label>
                <input
                  type="number"
                  value={preferredValuation}
                  onChange={(e) => setPreferredValuation(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Botão de Salvar */}
              <button type="submit" className="btn-primary">Salvar</button>
            </form>
          </>
        ) : (
          <div className="entity-data-display">
            <EntityCard entity={entityData} onEdit={handleEditAgain} />
            <button onClick={handleEditAgain} className="btn-primary">Responder Novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EntityForm;
