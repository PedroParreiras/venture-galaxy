// src/components/StartupInvestorMap/StartupInvestorMap.js

import React, { useEffect, useState } from 'react';
import './StartupInvestorMap.css';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

const SECTIONS = [
  'Aceleração',
  'Anjo',
  'Pre-Seed',
  'Seed',
  'Série A',
  'Série B',
  'Série C+',
];

const StartupInvestorMap = () => {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    const investorsCollection = collection(db, 'investors');

    const unsubscribeInvestors = onSnapshot(
      investorsCollection,
      (snapshot) => {
        const fetchData = async () => {
          const investorsData = [];
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            let logoURL = data.logoURL;
            if (logoURL && !logoURL.startsWith('http')) {
              const filePath = `logos/investors/${logoURL}`;
              const storageRef = ref(storage, filePath);
              try {
                logoURL = await getDownloadURL(storageRef);
              } catch (error) {
                console.error('Error fetching logo URL:', error);
                logoURL = null;
              }
            }
            investorsData.push({
              id: docSnap.id,
              ...data,
              logoURL,
              userType: 'investor',
            });
          }

          setLogos(investorsData);
        };

        fetchData();
      },
      (error) => {
        console.error('Erro ao buscar logos de investidores:', error);
      }
    );

    return () => {
      unsubscribeInvestors();
    };
  }, []);

  const determineCategory = (logo) => {
    if (logo.userType === 'investor' && logo.preferredStage) {
      const normalizedStage = logo.preferredStage.trim().toLowerCase();
      for (const section of SECTIONS) {
        if (section.toLowerCase() === normalizedStage) {
          return section;
        }
      }
      return null;
    }
    return null;
  };

  const getLogosByCategory = (category) => {
    return logos.filter((logo) => determineCategory(logo) === category);
  };

  const handleLogoClick = async (logo) => {
    if (logo.website) {
      try {
        const docRef = doc(db, 'investors', logo.id);
        await updateDoc(docRef, {
          interactionCount: increment(1),
        });
      } catch (error) {
        console.error('Erro ao registrar interação:', error);
      }
      window.open(logo.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="startup-investor-map-container">
      {SECTIONS.map((section, index) => (
        <div key={index} className="section">
          <h2 className="section-title">{section}</h2>
          <div className="logo-grid">
            {getLogosByCategory(section).map((logo) => (
              <div
                key={logo.id}
                className="logo-item"
                onClick={() => handleLogoClick(logo)}
                title={logo.website ? 'Clique para visitar o site' : ''}
                style={{ cursor: logo.website ? 'pointer' : 'default' }}
              >
                {logo.logoURL ? (
                  <img
                    src={logo.logoURL}
                    alt={logo.name || 'Logo'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/path/to/default-logo.png';
                    }}
                  />
                ) : (
                  <div className="logo-placeholder">{logo.name || 'Logo'}</div>
                )}
              </div>
            ))}
            {getLogosByCategory(section).length === 0 && (
              <p className="no-logos">Nenhuma logo nesta categoria.</p>
            )}
          </div>
          {index < SECTIONS.length - 1 && <hr className="separator" />}
        </div>
      ))}
    </div>
  );
};

export default StartupInvestorMap;
