// src/components/StartupImporter/StartupImporter.js

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { db, auth } from '../../firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './StartupImporter.css';
import { useAuth } from '../../contexts/AuthContext';

function StartupImporter() {
  const [excelData, setExcelData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [mappingCompleted, setMappingCompleted] = useState(false);
  const [investorData, setInvestorData] = useState({});
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchInvestorData = async () => {
      if (currentUser) {
        try {
          const investorDocRef = doc(db, 'investors', currentUser.uid);
          const investorDocSnap = await getDoc(investorDocRef);
          if (investorDocSnap.exists()) {
            setInvestorData(investorDocSnap.data());
          } else {
            console.error('Dados do investidor não encontrados');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do investidor:', error);
        }
      }
    };

    fetchInvestorData();
  }, [currentUser]);

  const requiredFields = [
    { field: 'email', label: 'Email (Obrigatório)' },
  ];

  const optionalFields = [
    { field: 'name', label: 'Nome da Startup' },
    { field: 'sector', label: 'Setor' },
    { field: 'valuation', label: 'Valuation' },
    { field: 'annualRevenue', label: 'Receita Anual' },
    { field: 'revenueModel', label: 'Modelo de Receita' },
    { field: 'originState', label: 'Estado de Origem' },
    { field: 'companyAge', label: 'Idade da Empresa' },
    { field: 'stage', label: 'Estágio' },
    // Adicione outros campos conforme necessário
  ];

  // Função para carregar a planilha
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setHeaders(jsonData[0]);
      setExcelData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  // Função para atualizar o mapeamento de colunas
  const handleColumnMappingChange = (field, column) => {
    setColumnMapping(prev => ({ ...prev, [field]: column }));
  };

  // Função para processar e importar startups
  const handleImportStartups = async () => {
    // Verificar se o campo email foi mapeado
    if (!columnMapping.email) {
      alert('O campo Email é obrigatório e deve ser mapeado.');
      return;
    }

    setUploading(true);

    try {
      const dataRows = excelData.slice(1); // Pular os cabeçalhos

      // Array para armazenar startups com percentual de match
      const startupsWithMatch = [];

      for (let row of dataRows) {
        // Criar objeto startup com base no mapeamento
        const startup = {};

        // Mapear campos obrigatórios
        const emailIndex = headers.indexOf(columnMapping.email);
        startup.email = row[emailIndex];

        // Verificar se o email existe
        if (!startup.email) continue;

        // Mapear campos opcionais
        for (let fieldObj of optionalFields) {
          const { field } = fieldObj;
          const columnName = columnMapping[field];
          if (columnName) {
            const index = headers.indexOf(columnName);
            startup[field] = row[index];
          }
        }

        // Criar usuário no Firebase Auth (opcional)
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, startup.email, 'defaultPassword123'); // Defina uma senha padrão ou gere uma aleatória
          const userId = userCredential.user.uid;

          // Salvar dados no Firestore
          await setDoc(doc(db, 'founders', userId), {
            ...startup,
            userId,
            role: 'founder',
          });

          // Calcular o percentual de match
          const matchPercentage = calculateMatchPercentage(startup, investorData);

          startupsWithMatch.push({
            ...startup,
            matchPercentage: matchPercentage.toFixed(2) + '%',
          });
        } catch (error) {
          console.error('Erro ao criar usuário:', error);
          // Você pode optar por continuar ou interromper em caso de erro
          continue;
        }
      }

      // Adicionar a coluna de match na planilha
      const updatedExcelData = [ // Cabeçalhos
        [...headers, 'Match Percentage'],
        // Dados
        ...startupsWithMatch.map(startup => {
          const row = headers.map(header => startup[columnMappingReverse(header)] || '');
          row.push(startup.matchPercentage);
          return row;
        }),
      ];

      // Gerar o arquivo Excel atualizado
      const worksheet = XLSX.utils.aoa_to_sheet(updatedExcelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Startups Classificadas');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Salvar o arquivo para download
      saveAs(blob, 'startups_classificadas.xlsx');

      setUploading(false);
      alert('Startups importadas e planilha atualizada gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao importar startups:', error);
      setUploading(false);
      alert('Ocorreu um erro ao importar as startups.');
    }
  };

  // Função para calcular o percentual de match entre a startup e o investidor
  const calculateMatchPercentage = (startup, investorData) => {
    let totalWeight = 0;
    const weights = {
      sector: 1,
      ticketSize: 1,
      revenue: 1,
      valuation: 1,
      revenueModel: 1,
      originState: 1,
      companyAge: 1,
      stage: 1,
    };
    const maxWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    const {
      sectorInterest = [],
      ticketSize = 1,
      preferredRevenue = 1,
      preferredValuation = 1,
      revenueIncome = [],
      originState = '',
      companieAge = 0,
      preferredStage = '',
    } = investorData;

    // Comparação de Setor
    if (sectorInterest.includes('Agnostic')) {
      totalWeight += weights.sector;
    } else if (startup.sector && sectorInterest.includes(startup.sector)) {
      totalWeight += weights.sector;
    }

    // Comparação de Tamanho do Ticket
    const ticketRatio = Math.min(ticketSize / (startup.valuation || 1), 1);
    totalWeight += ticketRatio * weights.ticketSize;

    // Comparação de Receita
    const revenueRatio = Math.min((startup.annualRevenue || 0) / (preferredRevenue || 1), 1);
    totalWeight += revenueRatio * weights.revenue;

    // Comparação de Valuation
    const valuationRatio = Math.min(preferredValuation / (startup.valuation || 1), 1);
    totalWeight += valuationRatio * weights.valuation;

    // Comparação de Modelo de Receita
    if (revenueIncome.includes('Agnostic')) {
      totalWeight += weights.revenueModel;
    } else if (startup.revenueModel && revenueIncome.includes(startup.revenueModel)) {
      totalWeight += weights.revenueModel;
    }

    // Comparação de Estado de Origem
    if (originState === 'Agnostic' || originState === '') {
      totalWeight += weights.originState;
    } else if (startup.originState && startup.originState === originState) {
      totalWeight += weights.originState;
    }

    // Comparação de Idade da Empresa
    const ageDifference = Math.abs((startup.companyAge || 0) - (companieAge || 0));
    const ageScore = ageDifference === 0 ? 1 : 1 / (ageDifference + 1);
    totalWeight += ageScore * weights.companyAge;

    // Comparação de Estágio
    if (preferredStage === 'Agnostic' || preferredStage === '') {
      totalWeight += weights.stage;
    } else if (startup.stage && startup.stage === preferredStage) {
      totalWeight += weights.stage;
    }

    const percentage = (totalWeight / maxWeight) * 100;
    return percentage;
  };

  // Função auxiliar para obter o campo correspondente a um cabeçalho
  const columnMappingReverse = (header) => {
    const fieldEntry = Object.entries(columnMapping).find(([field, columnName]) => columnName === header);
    return fieldEntry ? fieldEntry[0] : '';
  };

  return (
    <div className="startup-importer-container">
      <h2>Importar Startups e Calcular Compatibilidade</h2>

      {!excelData && (
        <div className="upload-section">
          <label>Faça upload da sua planilha de startups (.xlsx):</label>
          <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        </div>
      )}

      {excelData && !mappingCompleted && (
        <div className="mapping-section">
          <h3>Mapeie as colunas da planilha para as perguntas:</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMappingCompleted(true);
            }}
          >
            <table>
              <thead>
                <tr>
                  <th>Pergunta</th>
                  <th>Coluna da Planilha</th>
                </tr>
              </thead>
              <tbody>
                {requiredFields.map((fieldObj) => (
                  <tr key={fieldObj.field}>
                    <td>{fieldObj.label}</td>
                    <td>
                      <select
                        required
                        onChange={(e) => handleColumnMappingChange(fieldObj.field, e.target.value)}
                      >
                        <option value="">Selecione a coluna</option>
                        {headers.map((header, index) => (
                          <option key={index} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {optionalFields.map((fieldObj) => (
                  <tr key={fieldObj.field}>
                    <td>{fieldObj.label}</td>
                    <td>
                      <select
                        onChange={(e) => handleColumnMappingChange(fieldObj.field, e.target.value)}
                      >
                        <option value="">Não Mapear</option>
                        {headers.map((header, index) => (
                          <option key={index} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" className="btn-primary">
              Confirmar Mapeamento
            </button>
          </form>
        </div>
      )}

      {mappingCompleted && (
        <div className="import-section">
          <h3>Pronto para importar as startups.</h3>
          <button onClick={handleImportStartups} className="btn-primary" disabled={uploading}>
            {uploading ? 'Importando...' : 'Importar Startups'}
          </button>
        </div>
      )}
    </div>
  );
}

export default StartupImporter;
