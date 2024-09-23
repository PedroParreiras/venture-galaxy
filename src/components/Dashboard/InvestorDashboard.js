// src/components/Dashboard/InvestorDashboard.js
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './InvestorDashboard.css';
import InvestorFunnel from '../Funnel/InvestorFunnel';

function InvestorDashboard() {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [investorPreferences, setInvestorPreferences] = useState(null);

  useEffect(() => {
    const fetchInvestorPreferences = async () => {
      try {
        const doc = await db.collection('investorPreferences').doc(currentUser.uid).get();
        if (doc.exists) {
          setInvestorPreferences(doc.data());
        } else {
          console.log('Preferências do investidor não encontradas.');
        }
      } catch (error) {
        console.error('Erro ao obter preferências do investidor:', error);
      }
    };

    const fetchCompanies = async () => {
      try {
        const snapshot = await db.collection('companies').get();
        const companyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompanies(companyList);
      } catch (error) {
        console.error('Erro ao obter empresas:', error);
      }
    };

    fetchInvestorPreferences();
    fetchCompanies();
  }, [currentUser.uid]);

  return (
    <div className="investor-dashboard">
      <h2>Funil de Empresas</h2>
      <InvestorFunnel companies={companies} preferences={investorPreferences} />
    </div>
  );
}

export default InvestorDashboard;
