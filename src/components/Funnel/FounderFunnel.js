// src/components/Funnel/FounderFunnel.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './FounderFunnel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import EntityCard from '../EntityCard/EntityCard'; // Importing the EntityCard component

function FounderFunnel({ startup = {} }) {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [investorEmail, setInvestorEmail] = useState('');

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const investorsSnap = await getDocs(collection(db, 'investors'));
        const investorsData = investorsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setInvestors(investorsData);
      } catch (error) {
        console.error('Error fetching investors:', error);
      }
    };

    fetchInvestors();
  }, []);

  const fetchInvestorEmail = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setInvestorEmail(userDoc.data().email); // Set the investor's email
      }
    } catch (error) {
      console.error('Error fetching investor email:', error);
    }
  };

  const handleInvestorClick = (investor) => {
    setSelectedInvestor(investor);
    if (investor.founders && investor.founders[0]) {
      fetchInvestorEmail(investor.founders[0]); // Fetch the investor's email based on the user's ID
    }
  };

  const handleBackClick = () => {
    setSelectedInvestor(null);
    setInvestorEmail(''); // Reset the investor's email when going back
  };

  // Calculate the percentage score for each investor based on the startup's criteria
  const calculateWeightPercentage = (investor) => {
    let totalWeight = 0;
    const maxWeight = 4; // Maximum possible weight (1 each for sector, ticket size, revenue, and valuation)

    const {
      sector = '',
      valuation = 1,
      annualRevenue = 1,
    } = startup;

    if (investor.sectorInterest.includes('Agnostic')) {
      totalWeight += 1; // Agnostic always gives full weight for sector
    } else if (investor.sectorInterest.includes(sector)) {
      totalWeight += 1;
    } else {
      totalWeight += 0.25;
    }

    const ticketRatio = Math.min(valuation / (investor.ticketSize || 1), 1);
    totalWeight += ticketRatio > 0 ? ticketRatio : 0.1;

    const revenueRatio = Math.min(annualRevenue / (investor.preferredRevenue || 1), 1);
    totalWeight += revenueRatio > 0 ? revenueRatio : 0.1;

    const valuationRatio = Math.min(valuation / (investor.preferredValuation || 1), 1);
    totalWeight += valuationRatio > 0 ? valuationRatio : 0.1;

    const percentage = (totalWeight / maxWeight) * 100;
    return percentage;
  };

  return (
    <div className="founder-funnel">
      {selectedInvestor ? (
        <div className="selected-investor-view">
          <button className="back-button" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faArrowLeft} /> Voltar
          </button>
          {/* Display EntityCard without editing */}
          <EntityCard entity={selectedInvestor} onEdit={null} />
          {/* Display the investor's email */}
          {investorEmail && (
            <p className="contact-investor">
              Fale com o founder: {investorEmail}
            </p>
          )}
        </div>
      ) : (
        <>
          <h2>Funil de Investidores</h2>
          <div className="investors-list">
            {investors.map((investor, index) => {
              const percentage = calculateWeightPercentage(investor);

              return (
                <div
                  key={index}
                  className="investor-card"
                  onClick={() => handleInvestorClick(investor)}
                >
                  <div className="investor-info">
                    <h3>{investor.name}</h3>
                    <p>Setores de Interesse: {investor.sectorInterest.join(', ')}</p>
                    <p>Ticket Size: R$ {investor.ticketSize.toLocaleString()}</p>
                    <p>Preferred Valuation: R$ {investor.preferredValuation.toLocaleString()}</p>
                    <p>Preferred Annual Revenue: R$ {investor.preferredRevenue.toLocaleString()}</p>
                  </div>
                  <div className="investor-weight">
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

export default FounderFunnel;
