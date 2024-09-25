// src/components/Forms/CompanyForm.js
import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase'; // Certifique-se de que o Firebase está configurado corretamente
import { useAuth } from '../../contexts/AuthContext';
import './CompanyForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function CompanyForm() {
  const { currentUser } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Inicializa os estados com valores vazios ou os dados existentes
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [fundingNeeded, setFundingNeeded] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoURL, setLogoURL] = useState('');
  const [pitch, setPitch] = useState(null);
  const [pitchURL, setPitchURL] = useState('');
  const [employees, setEmployees] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [founderShare, setFounderShare] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [valuation, setValuation] = useState('');

  // Opções de Setores de Interesse (Pode ser separado ou mantido como select)
  const sectorOptions = [
    'Agnostic', 'Adtech', 'Agtech', 'Biotech', 'Cannabis', 'Cibersecurity', 'Cleantech',
    'Construtech', 'Datatech', 'Deeptech', 'Ecommerce', 'Edtech', 'Energytech', 'ESG',
    'Femtech', 'Fintech', 'Foodtech', 'Games', 'Govtech', 'Healthtech', 'HRtech', 'Indtech',
    'Insurtech', 'Legaltech', 'Logtech', 'MarketPlaces', 'Martech', 'Nanotech', 'Proptech',
    'Regtech', 'Retailtech', 'Socialtech', 'Software', 'Sporttech', 'Web3', 'Space',
  ];

  // Função para buscar os dados da empresa do Firestore
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'companies', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCompanyData(data);
            setCompanyName(data.name || '');
            setSector(data.sector || '');
            setFundingNeeded(data.fundingNeeded || '');
            setEmployees(data.employees || '');
            setCreationDate(data.creationDate || '');
            setFounderShare(data.founderShare || '');
            setAnnualRevenue(data.annualRevenue || '');
            setValuation(data.valuation || '');
            setLogoURL(data.logoURL || '');
            setPitchURL(data.pitchURL || '');
            setIsFormVisible(false);
          }
        } catch (error) {
          console.error('Erro ao buscar dados da empresa:', error);
        }
      }
    };

    fetchCompanyData();
  }, [currentUser]);

  // Função para fazer upload do logo
  const handleLogoUpload = async () => {
    if (!logo) return '';
    const logoRef = ref(storage, `logos/${currentUser.uid}/${logo.name}`);
    await uploadBytes(logoRef, logo);
    return await getDownloadURL(logoRef);
  };

  // Função para fazer upload do pitch
  const handlePitchUpload = async () => {
    if (!pitch) return '';
    const pitchRef = ref(storage, `pitches/${currentUser.uid}/${pitch.name}`);
    await uploadBytes(pitchRef, pitch);
    return await getDownloadURL(pitchRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedLogoURL = logoURL;
    let uploadedPitchURL = pitchURL;

    // Upload do Logo
    if (logo) {
      try {
        uploadedLogoURL = await handleLogoUpload();
        setLogoURL(uploadedLogoURL);
      } catch (error) {
        console.error('Erro ao fazer upload do logo:', error);
        alert('Ocorreu um erro ao fazer upload do logo. Tente novamente.');
        return;
      }
    }

    // Upload do Pitch
    if (pitch) {
      try {
        uploadedPitchURL = await handlePitchUpload();
        setPitchURL(uploadedPitchURL);
      } catch (error) {
        console.error('Erro ao fazer upload do pitch:', error);
        alert('Ocorreu um erro ao fazer upload do pitch. Tente novamente.');
        return;
      }
    }

    const data = {
      name: companyName,
      sector,
      fundingNeeded: parseFloat(fundingNeeded),
      employees: parseInt(employees, 10),
      creationDate,
      founderShare: parseFloat(founderShare),
      annualRevenue: parseFloat(annualRevenue),
      valuation: parseFloat(valuation),
      logoURL: uploadedLogoURL || '',
      pitchURL: uploadedPitchURL || '',
      founders: [currentUser.uid],
      allowedEditors: [currentUser.uid],
    };

    try {
      await setDoc(doc(db, 'companies', currentUser.uid), data, { merge: true });
      setCompanyData(data); // Atualiza o estado com os dados salvos
      setIsFormVisible(false); // Oculta o formulário após o envio
      alert('Empresa salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar a empresa:', error);
      alert('Erro ao salvar a empresa.');
    }
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleEditAgain = () => {
    setIsFormVisible(true); // Mostra o formulário para edição
  };

  return (
    <div className="company-form-container">
      <div className="company-form">
        {isFormVisible ? (
          <>
            <h2>{companyData ? 'Editar Empresa' : 'Nova Empresa'}</h2>
            <form onSubmit={handleSubmit}>
              {/* Logo da Empresa */}
              <div className="form-group">
                <label>Logo da Startup:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setLogo)}
                />
                {logoURL && (
                  <img src={logoURL} alt="Logo da Empresa" className="preview-image" />
                )}
              </div>

              {/* Nome da Empresa */}
              <div className="form-group">
                <label>Nome da Startup:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              {/* Pitch da Empresa */}
              <div className="form-group">
                <label>Pitch da Startup (PDF):</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setPitch)}
                />
                {pitchURL && (
                  <a href={pitchURL} target="_blank" rel="noopener noreferrer">
                    Visualizar Pitch
                  </a>
                )}
              </div>

              {/* Número de Funcionários */}
              <div className="form-group">
                <label>Número de Funcionários:</label>
                <input
                  type="number"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  required
                />
              </div>

              {/* Data de Criação */}
              <div className="form-group">
                <label>Data de Criação:</label>
                <input
                  type="date"
                  value={creationDate}
                  onChange={(e) => setCreationDate(e.target.value)}
                  required
                />
              </div>

              {/* Porcentagem na Mão de Fundadores */}
              <div className="form-group">
                <label>Porcentagem na Mão de Fundadores (%):</label>
                <input
                  type="number"
                  value={founderShare}
                  onChange={(e) => setFounderShare(e.target.value)}
                  required
                  min="0"
                  max="100"
                />
              </div>

              {/* Receita Anual */}
              <div className="form-group">
                <label>Receita Anual:</label>
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  required
                  min="0"
                />
              </div>

              {/* Setor de Atuação */}
              <div className="form-group">
                <label>Setor de Atuação:</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {sectorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valuation Atual */}
              <div className="form-group">
                <label>Valuation Atual:</label>
                <input
                  type="number"
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  required
                  min="0"
                />
              </div>

              {/* Botão de Envio */}
              <button type="submit" className="btn-primary">Salvar</button>
            </form>
          </>
        ) : (
          <div className="company-data-display">
            <h2>Dados da Empresa</h2>
            {logoURL && <img src={logoURL} alt="Logo da Empresa" className="entity-logo" />}
            {pitchURL && (
              <p>
                <strong>Pitch:</strong>{' '}
                <a href={pitchURL} target="_blank" rel="noopener noreferrer">
                  Visualizar Pitch
                </a>
              </p>
            )}
            <p><strong>Nome da Startup:</strong> {companyData.name}</p>
            <p><strong>Setor:</strong> {companyData.sector}</p>
            <p><strong>Número de Funcionários:</strong> {companyData.employees}</p>
            <p><strong>Data de Criação:</strong> {companyData.creationDate}</p>
            <p><strong>Porcentagem na Mão de Fundadores:</strong> {companyData.founderShare}%</p>
            <p><strong>Receita Anual:</strong> R$ {companyData.annualRevenue}</p>
            <p><strong>Valuation Atual:</strong> R$ {companyData.valuation}</p>
            <button onClick={handleEditAgain} className="btn-primary">Editar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyForm;
