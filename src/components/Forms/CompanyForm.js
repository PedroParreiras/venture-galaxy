// src/components/Forms/CompanyForm.js

import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase'; // Importando db e storage
import { useAuth } from '../../contexts/AuthContext';
import './CompanyForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Importando funções do Storage
import CompanyCard from '../CompanyCard/CompanyCard'; // Importando o CompanyCard

function CompanyForm() {
  const { currentUser } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Estados para os campos do formulário
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [fundingNeeded, setFundingNeeded] = useState('');
  const [employees, setEmployees] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [founderShare, setFounderShare] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [valuation, setValuation] = useState('');
  const [stage, setStage] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoURL, setLogoURL] = useState('');
  const [pitch, setPitch] = useState(null);
  const [pitchURL, setPitchURL] = useState('');
  const [uploadProgressLogo, setUploadProgressLogo] = useState(0); // Estado para progresso do logo
  const [uploadProgressPitch, setUploadProgressPitch] = useState(0); // Estado para progresso do pitch
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
    'Aceleração',
    'Anjo',
    'Pre-Seed',
    'Seed',
    'Série A',
    'Série B',
    'Série C',
    'Pre-IPO'
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
            setFundingNeeded(data.fundingNeeded ? data.fundingNeeded.toString() : '');
            setEmployees(data.employees ? data.employees.toString() : '');
            setCreationDate(data.creationDate || '');
            setFounderShare(data.founderShare ? data.founderShare.toString() : '');
            setAnnualRevenue(data.annualRevenue ? data.annualRevenue.toString() : '');
            setValuation(data.valuation ? data.valuation.toString() : '');
            setStage(data.stage || '');
            setLogoURL(data.logoURL || '');
            setPitchURL(data.pitchURL || '');
            setIsFormVisible(false);
          }
        } catch (error) {
          console.error('Erro ao buscar dados da empresa:', error);
          setError('Erro ao buscar seus dados. Tente novamente mais tarde.');
        }
      }
    };

    fetchCompanyData();
  }, [currentUser]);

  // Função para fazer upload do logo diretamente no Firebase Storage
  const handleLogoUpload = () => {
    return new Promise((resolve, reject) => {
      if (!logo) {
        resolve(''); // Se não houver logo para upload, retorna uma string vazia
        return;
      }

      const fileName = `${Date.now()}_${logo.name}`;
      const storageRefLogo = ref(storage, `logos/${currentUser.uid}/${fileName}`);
      const uploadTaskLogo = uploadBytesResumable(storageRefLogo, logo);

      uploadTaskLogo.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgressLogo(progress);
        },
        (error) => {
          console.error('Erro no upload do logo:', error);
          reject(new Error('Erro no upload do logo'));
        },
        () => {
          getDownloadURL(uploadTaskLogo.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  // Função para fazer upload do pitch diretamente no Firebase Storage
  const handlePitchUpload = () => {
    return new Promise((resolve, reject) => {
      if (!pitch) {
        resolve(''); // Se não houver pitch para upload, retorna uma string vazia
        return;
      }

      const fileName = `${Date.now()}_${pitch.name}`;
      const storageRefPitch = ref(storage, `pitches/${currentUser.uid}/${fileName}`);
      const uploadTaskPitch = uploadBytesResumable(storageRefPitch, pitch);

      uploadTaskPitch.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgressPitch(progress);
        },
        (error) => {
          console.error('Erro no upload do pitch:', error);
          reject(new Error('Erro no upload do pitch'));
        },
        () => {
          getDownloadURL(uploadTaskPitch.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Resetar erro antes de tentar novamente

    let uploadedLogoURL = logoURL;
    let uploadedPitchURL = pitchURL;

    // Upload do Logo
    if (logo) {
      try {
        uploadedLogoURL = await handleLogoUpload();
        setLogoURL(uploadedLogoURL);
      } catch (error) {
        setError('Ocorreu um erro ao fazer upload do logo. Tente novamente.');
        return;
      }
    }

    // Upload do Pitch
    if (pitch) {
      try {
        uploadedPitchURL = await handlePitchUpload();
        setPitchURL(uploadedPitchURL);
      } catch (error) {
        setError('Ocorreu um erro ao fazer upload do pitch. Tente novamente.');
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
      stage,
      logoURL: uploadedLogoURL || '',
      pitchURL: uploadedPitchURL || '',
      founders: [currentUser.uid],
      allowedEditors: [currentUser.uid],
    };

    try {
      await setDoc(doc(db, 'companies', currentUser.uid), data, { merge: true });
      setCompanyData(data); // Atualiza o estado com os dados salvos
      setIsFormVisible(false); // Oculta o formulário após o envio
      setUploadProgressLogo(0); // Reseta o progresso do upload do logo
      setUploadProgressPitch(0); // Reseta o progresso do upload do pitch
      setLogo(null); // Reseta o logo selecionado
      setPitch(null); // Reseta o pitch selecionado
      alert('Empresa salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar a empresa:', error);
      setError('Erro ao salvar a empresa. Tente novamente.');
    }
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleEditAgain = () => {
    setIsFormVisible(true);
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
                  accept="application/pdf"
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
                  min="1"
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
                  step="0.01"
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
                  step="0.01"
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

              {/* Estágio da Empresa */}
              <div className="form-group">
                <label>Estágio da Empresa:</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {stageOptions.map((option) => (
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
                  step="0.01"
                />
              </div>

              {/* Botão de Envio */}
              <button type="submit" className="btn-primary">Salvar</button>
            </form>
          </>
        ) : (
          <div className="company-data-display">
            <CompanyCard company={companyData} onEdit={handleEditAgain} />
            <button onClick={handleEditAgain} className="btn-primary">Editar</button>
          </div>
        )}
        {/* Exibir Progresso de Upload do Logo */}
        {uploadProgressLogo > 0 && uploadProgressLogo < 100 && (
          <div className="upload-progress">
            <p>Upload do Logo: {uploadProgressLogo}%</p>
            <progress value={uploadProgressLogo} max="100"></progress>
          </div>
        )}
        {/* Exibir Progresso de Upload do Pitch */}
        {uploadProgressPitch > 0 && uploadProgressPitch < 100 && (
          <div className="upload-progress">
            <p>Upload do Pitch: {uploadProgressPitch}%</p>
            <progress value={uploadProgressPitch} max="100"></progress>
          </div>
        )}
        {/* Exibir Erros */}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default CompanyForm;
