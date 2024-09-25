// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore'; // Para buscar o tipo de usuário e dados do Firestore
import { db } from '../firebase'; // Certifique-se de que o Firestore está corretamente configurado
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTachometerAlt, faFunnelDollar } from '@fortawesome/free-solid-svg-icons';
import CompanyForm from '../components/Forms/CompanyForm';
import EntityForm from '../components/Forms/EntityForm';
import FounderFunnel from '../components/Funnel/FounderFunnel';
import InvestorFunnel from '../components/Funnel/InvestorFunnel';
import CompanyCard from '../components/CompanyCard/CompanyCard'; // Importando o CompanyCard
import EntityCard from '../components/EntityCard/EntityCard'; // Importando o EntityCard

function Dashboard() {
  const { currentUser } = useAuth();
  const [view, setView] = useState(null); // Controla qual conteúdo deve ser renderizado
  const [userType, setUserType] = useState(null);
  const [hasData, setHasData] = useState(false); // Indica se o usuário já preencheu os dados
  const [userData, setUserData] = useState(null); // Dados do usuário (empresa ou investidor)

  // Pega o tipo de usuário e verifica se os dados já foram preenchidos
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userDataFromDB = userDocSnap.data();
            setUserType(userDataFromDB.userType); // Define o tipo de usuário (founder ou investor)

            // Dependendo do tipo de usuário, busca os dados na coleção correspondente
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

  // Função para renderizar o conteúdo com base na visualização atual
  const renderContent = () => {
    if (hasData && userType) {
      // Se o usuário já preencheu os dados, exibe o card correspondente
      return userType === 'founder' ? <CompanyCard company={userData} /> : <EntityCard entity={userData} />;
    }

    // Se o usuário ainda não preencheu os dados, exibe o formulário correspondente
    if (!hasData && userType) {
      return userType === 'founder' ? <CompanyForm /> : <EntityForm />;
    }

    // Se o tipo de usuário ainda não foi carregado ou há um erro, exibe uma mensagem de carregamento
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
      {!hasData && (
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
          {/* Você pode adicionar mais opções aqui */}
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="dashboard-content">
        {hasData ? (
          renderContent()
        ) : view === 'user-data' ? (
          renderContent()
        ) : view === 'user-funnel' && userType ? (
          userType === 'founder' ? <FounderFunnel /> : <InvestorFunnel />
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
