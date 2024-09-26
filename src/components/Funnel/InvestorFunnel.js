// src/components/Funnel/InvestorFunnel.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './InvestorFunnel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function InvestorFunnel({ investor = {} }) {
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const companiesSnap = await getDocs(collection(db, 'companies'));
        const companiesData = companiesSnap.docs.map((doc) => doc.data());
        setStartups(companiesData);
      } catch (error) {
        console.error('Error fetching startups:', error);
      }
    };

    fetchStartups();
  }, []);

  // Calculate the percentage score for each startup based on investor preferences
  const calculateWeightPercentage = (startup) => {
    let totalWeight = 0;
    const maxWeight = 4; // Maximum possible weight (1 each for sector, ticket size, revenue, and valuation)

    // Ensure investor's properties are available
    const {
      sectorInterest = [],
      ticketSize = 1,
      preferredRevenue = 1,
      preferredValuation = 1,
    } = investor;

    // Sector Interest Weight
    if (sectorInterest.includes('Agnostic')) {
      totalWeight += 1; // Agnostic always gives full weight for sector
    } else if (sectorInterest.includes(startup.sector)) {
      totalWeight += 1;
    } else {
      // If sector doesn't match, assign a minimum value to ensure some match percentage
      totalWeight += 0.25;
    }

    // Ticket Size Weight
    const ticketRatio = Math.min(ticketSize / (startup.valuation || 1), 1);
    totalWeight += ticketRatio > 0 ? ticketRatio : 0.1; // Ensures there's always a small contribution

    // Annual Revenue Weight
    const revenueRatio = Math.min(preferredRevenue / (startup.annualRevenue || 1), 1);
    totalWeight += revenueRatio > 0 ? revenueRatio : 0.1;

    // Valuation Weight
    const valuationRatio = Math.min(preferredValuation / (startup.valuation || 1), 1);
    totalWeight += valuationRatio > 0 ? valuationRatio : 0.1;

    // Calculate the percentage of the score
    const percentage = (totalWeight / maxWeight) * 100;

    return percentage;
  };

  return (
    <div className="investor-funnel">
      <h2>Funil de Startups</h2>
      <div className="startups-list">
        {startups.map((startup, index) => {
          const percentage = calculateWeightPercentage(startup);

          return (
            <div key={index} className="startup-card">
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
    </div>
  );
}

export default InvestorFunnel;
