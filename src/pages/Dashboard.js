// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faFunnelDollar,
  faMap,
  faBuilding,
  faRocket,
  faHandHoldingUsd,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import CompanyForm from '../components/Forms/CompanyForm';
import EntityForm from '../components/Forms/EntityForm';
import FounderFunnel from '../components/Funnel/FounderFunnel';
import InvestorFunnel from '../components/Funnel/InvestorFunnel';
import CompanyCard from '../components/CompanyCard/CompanyCard';
import EntityCard from '../components/EntityCard/EntityCard';
import StartupInvestorMap from '../components/StartupInvestorMap/StartupInvestorMap';
import StartupMap from '../components/StartupMap/StartupMap';
import Modal from 'react-modal';

// Set App Element for accessibility (required by react-modal)
Modal.setAppElement('#root');

function Dashboard() {
  const { currentUser } = useAuth();
  const [view, setView] = useState(null);
  const [userType, setUserType] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showUserTypePopup, setShowUserTypePopup] = useState(false);
  const [showProfileIncompletePopup, setShowProfileIncompletePopup] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userDataFromDB = userDocSnap.data();

            if (userDataFromDB.userType) {
              setUserType(userDataFromDB.userType);

              if (userDataFromDB.userType === 'founder') {
                const companyDocRef = doc(db, 'founders', currentUser.uid);
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
            } else {
              // If userType is not set, show the popup
              setShowUserTypePopup(true);
            }
          } else {
            // If user document doesn't exist, create one without userType
            await setDoc(userDocRef, { email: currentUser.email });
            setShowUserTypePopup(true);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleUserTypeSelect = async (type) => {
    if (type) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { userType: type }, { merge: true });
        setUserType(type);
        setShowUserTypePopup(false);
      } catch (error) {
        console.error('Erro ao salvar o tipo de usuário:', error);
      }
    }
  };

  const handleFunnelClick = () => {
    if (!hasData) {
      setShowProfileIncompletePopup(true);
    } else {
      setView('user-funnel');
    }
  };

  const renderContent = () => {
    if (view === 'user-data') {
      if (hasData && userType) {
        return userType === 'founder' ? (
          <CompanyCard company={userData} onEdit={() => setView('user-data')} />
        ) : (
          <EntityCard entity={userData} onEdit={() => setView('user-data')} />
        );
      } else if (!hasData && userType) {
        return userType === 'founder' ? <CompanyForm /> : <EntityForm />;
      }
    } else if (view === 'startup-investor-map') {
      return <StartupInvestorMap />;
    } else if (view === 'startup-map') {
      return <StartupMap />;
    } else {
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
        <h1>Welcome to the Orbit!</h1>
        <p>Seu painel personalizado para acompanhar suas atividades no Venture Galaxy.</p>
      </header>

      {/* User Type Popup */}
      {showUserTypePopup && (
        <div className="popup-overlay">
          <div className="popup user-type-popup">
            <h3>Selecione seu tipo de usuário</h3>
            <div className="user-type-options">
              <div
                className="user-type-card"
                onClick={() => handleUserTypeSelect('founder')}
              >
                <FontAwesomeIcon icon={faRocket} className="user-type-icon" />
                <h4>Founder</h4>
                <p>Eu represento uma startup.</p>
              </div>
              <div
                className="user-type-card"
                onClick={() => handleUserTypeSelect('investor')}
              >
                <FontAwesomeIcon icon={faHandHoldingUsd} className="user-type-icon" />
                <h4>Investor</h4>
                <p>Eu represento um investidor.</p>
              </div>
              <div
                className="user-type-card"
                onClick={() => handleUserTypeSelect('other')}
              >
                <FontAwesomeIcon icon={faQuestionCircle} className="user-type-icon" />
                <h4>Other</h4>
                <p>Outro tipo de usuário.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Incomplete Popup */}
      {showProfileIncompletePopup && (
        <div className="popup-overlay">
          <div className="popup profile-incomplete-popup">
            <h3>Perfil Incompleto</h3>
            <p>Por favor, complete seu perfil de {userType === 'founder' ? 'startup' : 'investidor'} para acessar o funil.</p>
            <button className="close-popup-btn" onClick={() => setShowProfileIncompletePopup(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Options */}
      {userType && (
        <div className="dashboard-options">
          <div className="option-card" onClick={() => setView('user-data')}>
            <FontAwesomeIcon icon={faUser} className="option-icon" />
            <h3>Dados do Usuário</h3>
            <p>Visualize e edite seus dados de usuário.</p>
          </div>
          <div className="option-card" onClick={handleFunnelClick}>
            <FontAwesomeIcon icon={faFunnelDollar} className="option-icon" />
            <h3>Funil do Usuário</h3>
            <p>Acompanhe o progresso do seu funil de atividades.</p>
          </div>
          <div className="option-card" onClick={() => setView('startup-investor-map')}>
            <FontAwesomeIcon icon={faMap} className="option-icon" />
            <h3>Brasil Startup Investor Map</h3>
            <p>Visualize o mapa de investidores por estágio preferido.</p>
          </div>
          <div className="option-card" onClick={() => setView('startup-map')}>
            <FontAwesomeIcon icon={faBuilding} className="option-icon" />
            <h3>Brasil Startup Map</h3>
            <p>Visualize o mapa de startups por estágio.</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-content">{renderContent()}</main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Venture Galaxy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
