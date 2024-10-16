// src/pages/ImportInvestors.js

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage, auth } from '../firebase'; // Certifique-se de que o auth está importado
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Função para criar usuários
import './ImportInvestors.css';

// Função para validar email
const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// Função para adicionar um atraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ImportInvestors() {
  const [investorsData, setInvestorsData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Função para carregar e processar a planilha
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      const headers = sheet[0]; // Primeira linha para os cabeçalhos
      const rows = sheet.slice(1); // Restante das linhas para os dados

      setColumns(headers);
      setInvestorsData(rows);
    };

    reader.readAsArrayBuffer(file);
  };

  // Função para gerar senha aleatória
  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  // Função para fazer o upload da imagem para o Firebase Storage
  const uploadLogo = async (url, investorId) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = `${investorId}_logo_${Date.now()}`;
      const storageRef = ref(storage, `logos/investors/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          () => {},
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      return null;
    }
  };

  // Função para criar usuário no Firebase Authentication e salvar dados no Firestore
  const createUserAndSaveInvestor = async (investor) => {
    try {
      const email = investor[columnMapping['email']];
      if (!email || !validateEmail(email)) {
        console.error(`Email inválido ou não encontrado para este investidor: ${email}, ignorando...`);
        return;
      }

      const password = generateRandomPassword();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Fazer upload do logo se existir
      const logoURL = investor[columnMapping['logo']] || '';
      let storedLogoURL = '';
      if (logoURL) {
        storedLogoURL = await uploadLogo(logoURL, userId);
      }

      // Dados a serem salvos no Firestore
      const dataToSave = {
        name: investor[columnMapping['name']] || '',
        email: investor[columnMapping['email']] || '',
        website: investor[columnMapping['website']] || '',
        logoURL: storedLogoURL,
        aum: parseFloat(investor[columnMapping['aum']] || 0),
        ticketSize: parseFloat(investor[columnMapping['ticketSize']] || 0),
        dryPowder: parseFloat(investor[columnMapping['dryPowder']] || 0),
        sectorInterest: investor[columnMapping['sectorInterest']]?.split(',') || [],
        preferredStage: investor[columnMapping['preferredStage']] || '',
        preferredValuation: parseFloat(investor[columnMapping['preferredValuation']] || 0),
        originState: investor[columnMapping['originState']] || '',
      };

      // Salvar no Firestore usando o `uid` do usuário criado
      await setDoc(doc(db, 'investors', userId), dataToSave, { merge: true });

      // Adicionar atraso de 1 segundo entre cada salvamento
      await delay(100);

    } catch (error) {
      console.error('Erro ao criar usuário e salvar investidor:', error);
    }
  };

  // Função para salvar todos os investidores com atraso de 5 segundos entre cada criação
  const saveInvestorsToFirebase = async () => {
    if (Object.keys(columnMapping).length === 0) {
      alert('Por favor, mapeie as colunas antes de continuar.');
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < investorsData.length; i++) {
        const investor = investorsData[i];
        await createUserAndSaveInvestor(investor); // Criar usuário e salvar dados

        // Adicionar atraso de 5 segundos entre cada criação de usuário
        await delay(3000);
      }

      alert('Todos os investidores foram salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar investidores:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="import-investors-container">
      <h2>Importar Investidores</h2>

      {/* Seção de Upload de Arquivo */}
      <div className="upload-section">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {/* Seção de Mapeamento de Colunas */}
      {columns.length > 0 && (
        <div className="mapping-section">
          <h3>Mapeie as colunas:</h3>
          {['name', 'email', 'logo', 'website', 'aum', 'ticketSize', 'dryPowder', 'sectorInterest', 'preferredStage', 'preferredValuation', 'originState'].map((field) => (
            <div key={field} className="mapping-row">
              <label>{field}</label>
              <select onChange={(e) => setColumnMapping({ ...columnMapping, [field]: e.target.value })}>
                <option value="">Selecione a coluna</option>
                {columns.map((col, index) => (
                  <option key={index} value={index}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Botão para salvar no Firebase */}
      {investorsData.length > 0 && (
        <div className="save-section">
          <button onClick={saveInvestorsToFirebase} disabled={isUploading}>
            {isUploading ? 'Salvando...' : 'Salvar Investidores'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ImportInvestors;
