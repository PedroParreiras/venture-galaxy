// src/components/Funnel/InvestorFunnel.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './InvestorFunnel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CompanyCard from '../CompanyCard/CompanyCard'; // Importing the CompanyCard component

function InvestorFunnel({ investor = {} }) {
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [founderEmail, setFounderEmail] = useState('');

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const companiesSnap = await getDocs(collection(db, 'companies'));
        const companiesData = companiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStartups(companiesData);
      } catch (error) {
        console.error('Error fetching startups:', error);
      }
    };

    fetchStartups();
  }, []);

  const fetchFounderEmail = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setFounderEmail(userDoc.data().email); // Set the founder's email
      }
    } catch (error) {
      console.error('Error fetching founder email:', error);
    }
  };

  const handleStartupClick = (startup) => {
    setSelectedStartup(startup);
    if (startup.founders && startup.founders[0]) {
      fetchFounderEmail(startup.founders[0]); // Fetch the founder's email based on the founder's user ID
    }
  };

  const handleBackClick = () => {
    setSelectedStartup(null);
    setFounderEmail(''); // Reset the founder's email when going back
  };

  // Calculate the percentage score for each startup based on investor preferences
  const calculateWeightPercentage = (startup) => {
    let totalWeight = 0;
    const maxWeight = 4; // Maximum possible weight (1 each for sector, ticket size, revenue, and valuation)

    const {
      sectorInterest = [],
      ticketSize = 1,
      preferredRevenue = 1,
      preferredValuation = 1,
    } = investor;

    if (sectorInterest.includes('Agnostic')) {
      totalWeight += 1;
    } else if (sectorInterest.includes(startup.sector)) {
      totalWeight += 1;
    } else {
      totalWeight += 0.25;
    }

    const ticketRatio = Math.min(ticketSize / (startup.valuation || 1), 1);
    totalWeight += ticketRatio > 0 ? ticketRatio : 0.1;

    const revenueRatio = Math.min(preferredRevenue / (startup.annualRevenue || 1), 1);
    totalWeight += revenueRatio > 0 ? revenueRatio : 0.1;

    const valuationRatio = Math.min(preferredValuation / (startup.valuation || 1), 1);
    totalWeight += valuationRatio > 0 ? valuationRatio : 0.1;

    const percentage = (totalWeight / maxWeight) * 100;
    return percentage;
  };

  return (
    <div className="investor-funnel">
      {selectedStartup ? (
        <div className="selected-startup-view">
          <button className="back-button" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faArrowLeft} /> Voltar
          </button>
          {/* Display CompanyCard without editing */}
          <CompanyCard company={selectedStartup} onEdit={null} />
          {/* Display the founder's email */}
          {founderEmail && (
            <p className="contact-founder">
              Fale com o founder: {founderEmail}
            </p>
          )}
        </div>
      ) : (
        <>
          <h2>Funil de Startups</h2>
          <div className="startups-list">
            {startups.map((startup, index) => {
              const percentage = calculateWeightPercentage(startup);

              return (
                <div
                  key={index}
                  className="startup-card"
                  onClick={() => handleStartupClick(startup)}
                >
                  <div className="startup-info">
                    <h3>{startup.name}</h3>
                    <p>Setor: {startup.sector}</p>
                    <p>Valuation: R$ {startup.valuation.toLocaleString()}</p>
                    <p>Receita Anual: R$ {startup.annualRevenue.toLocaleString()}</p>
                  </div>
                  <div className="startup-weight">
                    <FontAwesomeIcon icon={faStar} className="star-icon" />
                    <span>Pontuação: {percentage.toFixed(2)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default InvestorFunnel;
