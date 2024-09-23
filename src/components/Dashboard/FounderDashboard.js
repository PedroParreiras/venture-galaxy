// src/components/Dashboard/FounderDashboard.js
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './FounderDashboard.css';

function FounderDashboard() {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snapshot = await db
          .collection('companies')
          .where('founders', 'array-contains', currentUser.uid)
          .get();
        const companyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompanies(companyList);
      } catch (error) {
        console.error('Erro ao obter empresas:', error);
      }
    };

    fetchCompanies();
  }, [currentUser.uid]);

  return (
    <div className="founder-dashboard">
      <h2>Suas Empresas</h2>
      <Link to="/company-form" className="create-company-button">
        + Criar Nova Empresa
      </Link>
      <ul className="company-list">
        {companies.map(company => (
          <li key={company.id}>
            <Link to={`/company/${company.id}`}>{company.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FounderDashboard;
