// src/pages/CompanyPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import './CompanyPage.css';

function CompanyPage() {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const doc = await db.collection('companies').doc(companyId).get();
        if (doc.exists) {
          setCompanyData(doc.data());
        } else {
          console.log('Nenhuma empresa encontrada com este ID.');
        }
      } catch (error) {
        console.error('Erro ao obter dados da empresa:', error);
      }
    };

    fetchCompany();
  }, [companyId]);

  if (!companyData) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="company-page">
      <header className="company-header">
        <h1>{companyData.name}</h1>
      </header>
      <main className="company-main">
        <p><strong>Setor:</strong> {companyData.sector}</p>
        <p><strong>Valor de Captação:</strong> {companyData.fundingNeeded}</p>
        {/* Outros dados da empresa */}
      </main>
      <footer className="company-footer">
        {/* Botões para solicitar acesso ou editar (dependendo do tipo de usuário) */}
      </footer>
    </div>
  );
}

export default CompanyPage;
