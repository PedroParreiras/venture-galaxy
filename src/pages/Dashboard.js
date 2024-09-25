// src/pages/Dashboard.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore'; // Para buscar o tipo de usuário do Firestore
import { db } from '../firebase'; // Certifique-se de que o Firestore está corretamente configurado
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTachometerAlt, faFunnelDollar } from '@fortawesome/free-solid-svg-icons';
import CompanyForm from '../components/Forms/CompanyForm';
import EntityForm from '../components/Forms/EntityForm';
import FounderFunnel from '../components/Funnel/FounderFunnel';
import InvestorFunnel from '../components/Funnel/InvestorFunnel';

function Dashboard() {
  const { currentUser } = useAuth();
  const [view, setView] = useState(null); // Controla qual conteúdo deve ser renderizado
  const [userType, setUserType] = useState(null);

  // Pega o tipo de usuário do Firestore
  React.useEffect(() => {
    const fetchUserType = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserType(docSnap.data().userType); // Define o tipo de usuário (founder ou investor)
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    fetchUserType();
  }, [currentUser]);

  // Função para renderizar o conteúdo com base na visualização atual
  const renderContent = () => {
    switch (view) {
      case 'user-data':
        return userType === 'founder' ? <CompanyForm /> : <EntityForm />;
      case 'user-funnel':
        return userType === 'founder' ? <FounderFunnel /> : <InvestorFunnel />;
      default:
        return (
          <div className="placeholder">
            <p>Selecione uma opção acima para ver mais detalhes.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Bem-vindo, {currentUser?.email || 'Usuário'}!</h1>
        <p>Seu painel personalizado para acompanhar suas atividades no Venture Galaxy.</p>
      </header>

      <div className="dashboard-options">
        <div className="option-card" onClick={() => setView('user-data')}>
          <FontAwesomeIcon icon={faUser} className="option-icon" />
          <h3>Dados do Usuário</h3>
          <p>Visualize e edite seus dados de usuário.</p>
        </div>
        <div className="option-card" onClick={() => setView('dashboard')}>
          <FontAwesomeIcon icon={faTachometerAlt} className="option-icon" />
          <h3>Dashboard Geral</h3>
          <p>Veja um resumo geral das suas atividades.</p>
        </div>
        <div className="option-card" onClick={() => setView('user-funnel')}>
          <FontAwesomeIcon icon={faFunnelDollar} className="option-icon" />
          <h3>Funil do Usuário</h3>
          <p>Acompanhe o progresso do seu funil de atividades.</p>
        </div>
      </div>

      <main className="dashboard-content">{renderContent()}</main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Venture Galaxy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
