// src/components/Forms/CompanyForm.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './CompanyForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CompanyCard from '../CompanyCard/CompanyCard';

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

  // Opções de setores e estágios
  const sectorOptions = [/* suas opções */];
  const stageOptions = [/* suas opções */];

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
            setStage(data.stage || '');
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

  // Função para fazer upload do logo via Cloud Function
  const handleLogoUpload = async () => {
    if (!logo) return '';
    try {
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(logo);
      });

      const response = await fetch('https://us-central1-your-project.cloudfunctions.net/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: logo.name,
          fileData,
          fileType: logo.type,
          userId: currentUser.uid,
        }),
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

  // Função para fazer upload do pitch via Cloud Function
  const handlePitchUpload = async () => {
    if (!pitch) return '';
    try {
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pitch);
      });

      const response = await fetch('https://us-central1-your-project.cloudfunctions.net/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: pitch.name,
          fileData,
          fileType: pitch.type,
          userId: currentUser.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro no upload do pitch');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Erro ao fazer upload do pitch:', error);
      throw error;
    }
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
      stage,
      logoURL: uploadedLogoURL || '',
      pitchURL: uploadedPitchURL || '',
      founders: [currentUser.uid],
      allowedEditors: [currentUser.uid],
    };

    try {
      await setDoc(doc(db, 'companies', currentUser.uid), data, { merge: true });
      setCompanyData(data);
      setIsFormVisible(false);
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
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setPitch)}
                />
                {pitchURL && (
                  <a href={pitchURL} target="_blank" rel="noopener noreferrer">
                    Visualizar Pitch
                  </a>
                )}
              </div>

              {/* Outros campos */}
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
      </div>
    </div>
  );
}

export default CompanyForm;
