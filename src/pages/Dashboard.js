// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faFunnelDollar } from '@fortawesome/free-solid-svg-icons';
import CompanyForm from '../components/Forms/CompanyForm';
import EntityForm from '../components/Forms/EntityForm';
import FounderFunnel from '../components/Funnel/FounderFunnel';
import InvestorFunnel from '../components/Funnel/InvestorFunnel';
import CompanyCard from '../components/CompanyCard/CompanyCard';
import EntityCard from '../components/EntityCard/EntityCard';

function Dashboard() {
  const { currentUser } = useAuth();
  const [view, setView] = useState(null);
  const [userType, setUserType] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userDataFromDB = userDocSnap.data();
            setUserType(userDataFromDB.userType);

            if (userDataFromDB.userType === 'founder') {
              const companyDocRef = doc(db, 'companies', currentUser.uid);
              const companyDocSnap = await getDoc(companyDocRef);
              if (companyDocSnap.exists()) {
                setUserData(companyDocSnap.data());
                setHasData(true);
              } else {
                setHasData(false);
              }
            } else if (userDataFromDB.userType === 'investor') {
              const entityDocRef = doc(db, 'investors', currentUser.uid);
              const entityDocSnap = await getDoc(entityDocRef);
              if (entityDocSnap.exists()) {
                setUserData(entityDocSnap.data());
                setHasData(true);
              } else {
                setHasData(false);
              }
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const renderContent = () => {
    if (hasData && userType) {
      return userType === 'founder' ? (
        <CompanyCard company={userData} onEdit={() => setView('user-data')} />
      ) : (
        <EntityCard entity={userData} onEdit={() => setView('user-data')} />
      );
    }

    if (!hasData && userType) {
      return userType === 'founder' ? <CompanyForm /> : <EntityForm />;
    }

    return (
      <div className="placeholder">
        <p>Carregando...</p>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Bem-vindo, {currentUser?.email || 'Usuário'}!</h1>
        <p>Seu painel personalizado para acompanhar suas atividades no Venture Galaxy.</p>
      </header>

      {/* Opções do Dashboard */}
      {!hasData && userType && (
        <div className="dashboard-options">
          <div className="option-card" onClick={() => setView('user-data')}>
            <FontAwesomeIcon icon={faUser} className="option-icon" />
            <h3>Dados do Usuário</h3>
            <p>Visualize e edite seus dados de usuário.</p>
          </div>
          <div className="option-card" onClick={() => setView('user-funnel')}>
            <FontAwesomeIcon icon={faFunnelDollar} className="option-icon" />
            <h3>Funil do Usuário</h3>
            <p>Acompanhe o progresso do seu funil de atividades.</p>
          </div>
          {/* Adicione mais opções conforme necessário */}
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="dashboard-content">
        {view === 'user-data' ? (
          renderContent()
        ) : view === 'user-funnel' && userType ? (
          userType === 'founder' ? <FounderFunnel /> : <InvestorFunnel />
        ) : hasData ? (
          renderContent()
        ) : (
          <div className="placeholder">
            <p>Selecione uma opção acima para ver mais detalhes.</p>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Venture Galaxy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
