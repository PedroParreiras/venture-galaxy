// src/components/Forms/EntityForm.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './EntityForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function EntityForm() {
  const { currentUser } = useAuth();
  const [entityData, setEntityData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Inicializa os estados com valores vazios ou os dados existentes
  const [entityName, setEntityName] = useState('');
  const [sectorInterest, setSectorInterest] = useState('');
  const [aum, setAum] = useState('');
  const [ticketSize, setTicketSize] = useState('');
  const [dryPowder, setDryPowder] = useState('');
  const [lookingFor, setLookingFor] = useState('');

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
            setEntityName(data.name);
            setSectorInterest(data.sectorInterest);
            setAum(data.aum);
            setTicketSize(data.ticketSize);
            setDryPowder(data.dryPowder);
            setLookingFor(data.lookingFor);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do investidor:', error);
        }
      }
    };

    fetchEntityData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: entityName,
      sectorInterest,
      aum: parseFloat(aum),
      ticketSize: parseFloat(ticketSize),
      dryPowder: parseFloat(dryPowder),
      lookingFor,
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
              <label>Nome da Entidade:</label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                required
              />

              <label>Setores de Interesse:</label>
              <input
                type="text"
                value={sectorInterest}
                onChange={(e) => setSectorInterest(e.target.value)}
                required
              />

              <label>Assets Under Management (AUM):</label>
              <input
                type="number"
                value={aum}
                onChange={(e) => setAum(e.target.value)}
                required
              />

              <label>Most Common Ticket Size:</label>
              <input
                type="number"
                value={ticketSize}
                onChange={(e) => setTicketSize(e.target.value)}
                required
              />

              <label>Dry Powder:</label>
              <input
                type="number"
                value={dryPowder}
                onChange={(e) => setDryPowder(e.target.value)}
                required
              />

              <label>O que está procurando em uma Startup?</label>
              <textarea
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                required
              />

              <button type="submit" className="btn-primary">Salvar</button>
            </form>
          </>
        ) : (
          <div className="entity-data-display">
            <h2>Informações do Investidor</h2>
            <p><strong>Nome da Entidade:</strong> {entityData.name}</p>
            <p><strong>Setores de Interesse:</strong> {entityData.sectorInterest}</p>
            <p><strong>Assets Under Management:</strong> R$ {entityData.aum}</p>
            <p><strong>Most Common Ticket Size:</strong> R$ {entityData.ticketSize}</p>
            <p><strong>Dry Powder:</strong> R$ {entityData.dryPowder}</p>
            <p><strong>O que está procurando:</strong> {entityData.lookingFor}</p>
            <button onClick={handleEditAgain} className="btn-primary">Responder Novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EntityForm;
