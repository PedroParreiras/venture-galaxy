import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './StartupClassifier.css';

function StartupClassifier({ investorPreferences }) {
  const [excelData, setExcelData] = useState(null);
  const [classifiedData, setClassifiedData] = useState(null);

  // Função para carregar a planilha
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelData(json); // Salvar os dados da planilha
    };

    reader.readAsArrayBuffer(file);
  };

  // Função para classificar as startups
  const classifyStartups = () => {
    if (!excelData) {
      alert('Por favor, faça upload de uma planilha primeiro.');
      return;
    }

    // Supomos que as colunas são: Nome, Setor, TicketSize, Estágio, Receita
    const headers = excelData[0]; // Primeira linha são os headers
    const startups = excelData.slice(1); // Linhas seguintes são os dados

    const classifiedStartups = startups.map((startup) => {
      const name = startup[headers.indexOf('Nome')];
      const sector = startup[headers.indexOf('Setor')];
      const ticketSize = parseFloat(startup[headers.indexOf('TicketSize')]);
      const stage = startup[headers.indexOf('Estágio')];
      const revenue = parseFloat(startup[headers.indexOf('Receita')]);

      // Classificar com base nas preferências do investidor
      const matchScore = calculateMatchScore({
        sector,
        ticketSize,
        stage,
        revenue,
        investorPreferences,
      });

      return [...startup, matchScore]; // Adiciona a pontuação de compatibilidade
    });

    const newHeaders = [...headers, 'MatchScore']; // Adiciona uma coluna de MatchScore
    const classifiedDataWithHeaders = [newHeaders, ...classifiedStartups];

    setClassifiedData(classifiedDataWithHeaders);
  };

  // Função para calcular a pontuação de compatibilidade
  const calculateMatchScore = ({ sector, ticketSize, stage, revenue, investorPreferences }) => {
    let score = 0;

    if (investorPreferences.sectorInterest.includes(sector)) score += 1;
    if (ticketSize >= investorPreferences.ticketSize.min && ticketSize <= investorPreferences.ticketSize.max)
      score += 1;
    if (investorPreferences.preferredStage.includes(stage)) score += 1;
    if (revenue >= investorPreferences.preferredRevenue.min && revenue <= investorPreferences.preferredRevenue.max)
      score += 1;

    return score; // Pontuação final
  };

  // Função para exportar a planilha classificada
  const handleExport = () => {
    if (!classifiedData) {
      alert('Nenhuma classificação foi feita.');
      return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(classifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Classificação');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, 'startups_classificadas.xlsx');
  };

  return (
    <div className="classifier-container">
      <h2>Classificar Startups com Base nas Preferências do Investidor</h2>

      {/* Upload da planilha */}
      <input type="file" accept=".xlsx" onChange={handleFileUpload} className="file-input" />
      <button onClick={classifyStartups} className="btn-primary">Classificar Startups</button>

      {/* Download da planilha classificada */}
      <button onClick={handleExport} className="btn-secondary" disabled={!classifiedData}>
        Download Planilha Classificada
      </button>
    </div>
  );
}

export default StartupClassifier;
