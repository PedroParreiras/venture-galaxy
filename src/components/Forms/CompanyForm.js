// src/components/Forms/CompanyForm.js

import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase'; // Importing db and storage
import { useAuth } from '../../contexts/AuthContext';
import './CompanyForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Importing Storage functions
import CompanyCard from '../CompanyCard/CompanyCard'; // Importing CompanyCard

function CompanyForm() {
  const { currentUser } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // States for form fields
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
  const [uploadProgressLogo, setUploadProgressLogo] = useState(0);
  const [uploadProgressPitch, setUploadProgressPitch] = useState(0);
  const [error, setError] = useState('');

  // New state variables for additional fields
  const [revenueIncome, setRevenueIncome] = useState([]);
  const [originState, setOriginState] = useState('');
  const [companieAge, setCompanieAge] = useState('');
  const [website, setWebsite] = useState(''); // Added website state variable

  // Options for sectors, stages, and revenue income
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
  const revenueIncomeOptions = ['B2C', 'B2B2C', 'B2G', 'P2P', 'O2O', 'C2S', 'Outro'];

  // Fetch company data from Firestore
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
            setRevenueIncome(data.revenueIncome || []);
            setOriginState(data.originState || '');
            setCompanieAge(data.companieAge ? data.companieAge.toString() : '');
            setWebsite(data.website || ''); // Set website state
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

  // Function to upload logo to Firebase Storage
  const handleLogoUpload = () => {
    return new Promise((resolve, reject) => {
      if (!logo) {
        resolve('');
        return;
      }

      const fileName = `${Date.now()}_${logo.name}`;
      const storageRefLogo = ref(storage, `logos/${currentUser.uid}/${fileName}`);
      const uploadTaskLogo = uploadBytesResumable(storageRefLogo, logo);

      uploadTaskLogo.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
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

  // Function to upload pitch to Firebase Storage
  const handlePitchUpload = () => {
    return new Promise((resolve, reject) => {
      if (!pitch) {
        resolve('');
        return;
      }

      const fileName = `${Date.now()}_${pitch.name}`;
      const storageRefPitch = ref(storage, `pitches/${currentUser.uid}/${fileName}`);
      const uploadTaskPitch = uploadBytesResumable(storageRefPitch, pitch);

      uploadTaskPitch.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
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
    setError('');

    let uploadedLogoURL = logoURL;
    let uploadedPitchURL = pitchURL;

    // Upload Logo
    if (logo) {
      try {
        uploadedLogoURL = await handleLogoUpload();
        setLogoURL(uploadedLogoURL);
      } catch (error) {
        setError('Ocorreu um erro ao fazer upload do logo. Tente novamente.');
        return;
      }
    }

    // Upload Pitch
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
      revenueIncome,
      originState,
      companieAge: parseInt(companieAge, 10),
      website, // Include website in data object
    };

    try {
      await setDoc(doc(db, 'companies', currentUser.uid), data, { merge: true });
      setCompanyData(data);
      setIsFormVisible(false);
      setUploadProgressLogo(0);
      setUploadProgressPitch(0);
      setLogo(null);
      setPitch(null);
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

              {/* Revenue Income */}
              <div className="form-group">
                <label>Modelo de Receita:</label>
                <div className="checkbox-group">
                  {revenueIncomeOptions.map((option) => (
                    <label key={option} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={option}
                        checked={revenueIncome.includes(option)}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          setRevenueIncome(
                            checked
                              ? [...revenueIncome, value]
                              : revenueIncome.filter((item) => item !== value)
                          );
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Origin State */}
              <div className="form-group">
                <label>Estado de Origem:</label>
                <input
                  type="text"
                  value={originState}
                  onChange={(e) => setOriginState(e.target.value)}
                  required
                />
              </div>

              {/* Company Age */}
              <div className="form-group">
                <label>Anos de Operação:</label>
                <input
                  type="number"
                  value={companieAge}
                  onChange={(e) => setCompanieAge(e.target.value)}
                  required
                  min="0"
                />
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

              {/* Funding Needed */}
              <div className="form-group">
                <label>Investimento Necessário:</label>
                <input
                  type="number"
                  value={fundingNeeded}
                  onChange={(e) => setFundingNeeded(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary">Salvar</button>
            </form>
          </>
        ) : (
          <div className="company-data-display">
            <CompanyCard company={companyData} onEdit={handleEditAgain} />
            <button onClick={handleEditAgain} className="btn-primary">
              Editar
            </button>
          </div>
        )}
        {/* Upload Progress for Logo */}
        {uploadProgressLogo > 0 && uploadProgressLogo < 100 && (
          <div className="upload-progress">
            <p>Upload do Logo: {uploadProgressLogo}%</p>
            <progress value={uploadProgressLogo} max="100"></progress>
          </div>
        )}
        {/* Upload Progress for Pitch */}
        {uploadProgressPitch > 0 && uploadProgressPitch < 100 && (
          <div className="upload-progress">
            <p>Upload do Pitch: {uploadProgressPitch}%</p>
            <progress value={uploadProgressPitch} max="100"></progress>
          </div>
        )}
        {/* Display Errors */}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default CompanyForm;
