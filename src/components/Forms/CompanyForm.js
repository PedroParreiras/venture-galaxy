// src/components/Forms/CompanyForm.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './CompanyForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function CompanyForm() {
  const { currentUser } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Inicializa os estados com valores vazios ou os dados existentes
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [fundingNeeded, setFundingNeeded] = useState('');
  const [logo, setLogo] = useState(null);
  const [pitch, setPitch] = useState(null);
  const [employees, setEmployees] = useState('');
  const [creationDate, setCreationDate] = useState('');
  const [founderShare, setFounderShare] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [valuation, setValuation] = useState('');

  // Função para buscar os dados do usuário do Firestore
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'companies', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCompanyData(data);
            setCompanyName(data.name);
            setSector(data.sector);
            setFundingNeeded(data.fundingNeeded);
            setEmployees(data.employees);
            setCreationDate(data.creationDate);
            setFounderShare(data.founderShare);
            setAnnualRevenue(data.annualRevenue);
            setValuation(data.valuation);
          }
        } catch (error) {
          console.error('Erro ao buscar dados da empresa:', error);
        }
      }
    };

    fetchCompanyData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: companyName,
      sector,
      fundingNeeded: parseFloat(fundingNeeded),
      employees: parseInt(employees, 10),
      creationDate,
      founderShare: parseFloat(founderShare),
      annualRevenue: parseFloat(annualRevenue),
      valuation: parseFloat(valuation),
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
              <label>Logo da Startup:</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogo)} />

              <label>Nome da Startup:</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />

              <label>Pitch da Startup (PDF):</label>
              <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, setPitch)} />

              <label>Número de Funcionários:</label>
              <input
                type="number"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                required
              />

              <label>Data de Criação:</label>
              <input
                type="date"
                value={creationDate}
                onChange={(e) => setCreationDate(e.target.value)}
                required
              />

              <label>Porcentagem na Mão de Fundadores (%):</label>
              <input
                type="number"
                value={founderShare}
                onChange={(e) => setFounderShare(e.target.value)}
                required
              />

              <label>Receita Anual:</label>
              <input
                type="number"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
                required
              />

              <label>Setor de Atuação:</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)} required>
                <option value="">Selecione</option>
                {[
                  'Agnostic', 'Adtech', 'Agtech', 'Biotech', 'Cannabis', 'Cibersecurity', 'Cleantech',
                  'Construtech', 'Datatech', 'Deeptech', 'Ecommerce', 'Edtech', 'Energytech', 'ESG',
                  'Femtech', 'Fintech', 'Foodtech', 'Games', 'Govtech', 'Healthtech', 'HRtech', 'Indtech',
                  'Insurtech', 'Legaltech', 'Logtech', 'MarketPlaces', 'Martech', 'Nanotech', 'Proptech',
                  'Regtech', 'Retailtech', 'Socialtech', 'Software', 'Sporttech', 'Web3', 'Space',
                ].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label>Valuation Atual:</label>
              <input
                type="number"
                value={valuation}
                onChange={(e) => setValuation(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">Salvar</button>
            </form>
          </>
        ) : (
          <div className="company-data-display">
            <h2>Dados da Empresa</h2>
            <p><strong>Nome da Startup:</strong> {companyData.name}</p>
            <p><strong>Setor:</strong> {companyData.sector}</p>
            <p><strong>Número de Funcionários:</strong> {companyData.employees}</p>
            <p><strong>Data de Criação:</strong> {companyData.creationDate}</p>
            <p><strong>Porcentagem na Mão de Fundadores:</strong> {companyData.founderShare}%</p>
            <p><strong>Receita Anual:</strong> R$ {companyData.annualRevenue}</p>
            <p><strong>Valuation Atual:</strong> R$ {companyData.valuation}</p>
            <button onClick={handleEditAgain} className="btn-primary">Responder Novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyForm;
