// src/components/Funnel/FounderFunnel.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './FounderFunnel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function FounderFunnel({ startup = {} }) {
  const [investors, setInvestors] = useState([]);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const investorsSnap = await getDocs(collection(db, 'investors'));
        const investorsData = investorsSnap.docs.map((doc) => doc.data());
        setInvestors(investorsData);
      } catch (error) {
        console.error('Error fetching investors:', error);
      }
    };

    fetchInvestors();
  }, []);

  // Calculate the percentage score for each investor based on the startup's criteria
  const calculateWeightPercentage = (investor) => {
    let totalWeight = 0;
    const maxWeight = 4; // Maximum possible weight (1 each for sector, ticket size, revenue, and valuation)

    // Ensure startup's properties are available
    const {
      sector = '',
      valuation = 1,
      annualRevenue = 1,
    } = startup;

    // Sector Interest Weight
    if (investor.sectorInterest.includes('Agnostic')) {
      totalWeight += 1; // Agnostic always gives full weight for sector
    } else if (investor.sectorInterest.includes(sector)) {
      totalWeight += 1;
    } else {
      // If sector doesn't match, assign a minimum value to ensure some match percentage
      totalWeight += 0.25;
    }

    // Ticket Size Weight (Inverse, how well the investor's ticket size aligns with startup valuation)
    const ticketRatio = Math.min(valuation / (investor.ticketSize || 1), 1);
    totalWeight += ticketRatio > 0 ? ticketRatio : 0.1; // Ensures there's always a small contribution

    // Preferred Annual Revenue Weight (Inverse, how well the investor's preferred revenue aligns with the startup's revenue)
    const revenueRatio = Math.min(annualRevenue / (investor.preferredRevenue || 1), 1);
    totalWeight += revenueRatio > 0 ? revenueRatio : 0.1;

    // Valuation Weight (Inverse, how well the investor's preferred valuation aligns with the startup's valuation)
    const valuationRatio = Math.min(valuation / (investor.preferredValuation || 1), 1);
    totalWeight += valuationRatio > 0 ? valuationRatio : 0.1;

    // Calculate the percentage of the score
    const percentage = (totalWeight / maxWeight) * 100;

    return percentage;
  };

  return (
    <div className="founder-funnel">
      <h2>Funil de Investidores</h2>
      <div className="investors-list">
        {investors.map((investor, index) => {
          const percentage = calculateWeightPercentage(investor);

          return (
            <div key={index} className="investor-card">
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
    </div>
  );
}

export default FounderFunnel;
