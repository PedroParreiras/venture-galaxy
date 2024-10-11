// src/components/Forms/EntityForm.js

import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './EntityForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function EntityForm({ entity, onSubmit, onCancel }) {
  const { currentUser } = useAuth();

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
  const [website, setWebsite] = useState('');
  const [revenueIncome, setRevenueIncome] = useState([]);
  const [originState, setOriginState] = useState('');
  const [companieAge, setCompanieAge] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Opções de setores e estágios
  const sectorOptions = [
    'Agnostic', 'Adtech', 'Agtech', 'Biotech', 'Cannabis', 'Cibersecurity', 'Cleantech',
    'Construtech', 'Datatech', 'Deeptech', 'Ecommerce', 'Edtech', 'Energytech', 'ESG',
    'Femtech', 'Fintech', 'Foodtech', 'Games', 'Govtech', 'Healthtech', 'HRtech', 'Indtech',
    'Insurtech', 'Legaltech', 'Logtech', 'MarketPlaces', 'Martech', 'Nanotech', 'Proptech',
    'Regtech', 'Retailtech', 'Socialtech', 'Software', 'Sporttech', 'Web3', 'Space'
  ];

  const stageOptions = [
    'Aceleração', 'Anjo', 'Pre-Seed', 'Seed', 'Série A', 'Série B', 'Série C', 'Pre-IPO'
  ];

  const revenueIncomeOptions = ['B2C', 'B2B2C', 'B2G', 'P2P', 'O2O', 'C2S', 'Outro'];

  // Buscar dados da entidade no Firestore
  useEffect(() => {
    const fetchEntityData = async () => {
      if (currentUser && entity) {
        try {
          const docRef = doc(db, 'investors', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEntityName(data.name || '');
            setSectorInterest(data.sectorInterest || []);
            setAum(data.aum?.toString() || '');
            setTicketSize(data.ticketSize?.toString() || '');
            setDryPowder(data.dryPowder?.toString() || '');
            setPreferredStage(data.preferredStage || '');
            setPreferredRevenue(data.preferredRevenue?.toString() || '');
            setPreferredValuation(data.preferredValuation?.toString() || '');
            setLogoURL(data.logoURL || '');
            setWebsite(data.website || '');
            setRevenueIncome(data.revenueIncome || []);
            setOriginState(data.originState || '');
            setCompanieAge(data.companieAge?.toString() || '');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do investidor:', error);
          setError('Falha ao carregar os dados. Por favor, tente novamente mais tarde.');
        }
      }
    };
    fetchEntityData();
  }, [currentUser, entity]);

  // Fazer upload do logo para o Firebase Storage
  const handleLogoUpload = () => {
    return new Promise((resolve, reject) => {
      if (!logo) resolve('');

      const fileName = `${Date.now()}_${logo.name}`;
      const storageRef = ref(storage, `logos/${currentUser.uid}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, logo);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Erro no upload:', error);
          reject(new Error('Falha no upload do logo'));
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let uploadedLogoURL = logoURL;

    if (logo) {
      try {
        uploadedLogoURL = await handleLogoUpload();
        setLogoURL(uploadedLogoURL);
      } catch (error) {
        setError('Falha ao fazer upload do logo. Tente novamente.');
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
      website,
      revenueIncome,
      originState,
      companieAge: parseInt(companieAge),
      allowedEditors: [currentUser.uid],
    };

    try {
      await setDoc(doc(db, 'investors', currentUser.uid), data, { merge: true });
      onSubmit(data); // Passa os dados atualizados para o componente pai
      setUploadProgress(0);
      setLogo(null);
    } catch (error) {
      console.error('Erro ao salvar os dados da entidade:', error);
      setError('Erro ao salvar os dados. Tente novamente.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setLogo(e.target.files[0]);
  };

  return (
    <div className="entity-form-container">
      <form onSubmit={handleSubmit}>
        {/* Upload do Logo */}
        <div className="form-group">
          <label>Logo da Entidade:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {logoURL && <img src={logoURL} alt="Logo da Entidade" className="preview-image" />}
        </div>

        {/* Nome da Entidade */}
        <div className="form-group">
          <label>Nome da Entidade:</label>
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            required
          />
        </div>

        {/* Website */}
        <div className="form-group">
          <label>Website:</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </div>

        {/* Setores de Interesse */}
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
                    setSectorInterest(checked ? [...sectorInterest, value] : sectorInterest.filter(item => item !== value));
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Modelo de Receita */}
        <div className="form-group">
          <label>Modelo de Receita Preferido:</label>
          <div className="checkbox-group">
            {revenueIncomeOptions.map((option) => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={revenueIncome.includes(option)}
                  onChange={(e) => {
                    const { value, checked } = e.target;
                    setRevenueIncome(checked ? [...revenueIncome, value] : revenueIncome.filter(item => item !== value));
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Estado de Origem */}
        <div className="form-group">
          <label>Estado de Origem:</label>
          <input
            type="text"
            value={originState}
            onChange={(e) => setOriginState(e.target.value)}
            required
          />
        </div>

        {/* Idade da Empresa */}
        <div className="form-group">
          <label>Idade Preferida da Startup (anos de operação):</label>
          <input
            type="number"
            value={companieAge}
            onChange={(e) => setCompanieAge(e.target.value)}
            required
            min="0"
          />
        </div>

        {/* AUM */}
        <div className="form-group">
          <label>AUM da Entidade (Ativos sob Gestão):</label>
          <input
            type="number"
            value={aum}
            onChange={(e) => setAum(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Tamanho do Ticket */}
        <div className="form-group">
          <label>Tamanho do Ticket da Entidade:</label>
          <input
            type="number"
            value={ticketSize}
            onChange={(e) => setTicketSize(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Dry Powder */}
        <div className="form-group">
          <label>Dry Powder da Entidade:</label>
          <input
            type="number"
            value={dryPowder}
            onChange={(e) => setDryPowder(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Estágio Preferido */}
        <div className="form-group">
          <label>Estágio Preferido:</label>
          <select
            value={preferredStage}
            onChange={(e) => setPreferredStage(e.target.value)}
            required
          >
            <option value="">Selecione</option>
            {stageOptions.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Receita Anual Preferida */}
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

        {/* Valuation Preferido */}
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

        {/* Botões de Ação */}
        <div className="form-buttons">
          <button type="submit" className="btn-primary">Salvar</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        </div>
      </form>

      {/* Progresso do Upload do Logo */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <p>Upload do logo em andamento: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100"></progress>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default EntityForm;
