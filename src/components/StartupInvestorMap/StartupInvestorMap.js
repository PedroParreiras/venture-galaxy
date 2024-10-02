// src/components/StartupInvestorMap/StartupInvestorMap.js
import React, { useEffect, useState } from 'react';
import './StartupInvestorMap.css';
import { db } from '../../firebase'; // Importa a instância do Firestore
import { collection, onSnapshot } from 'firebase/firestore';

// Títulos das seções
const SECTIONS = [
    'Aceleração',
    'Anjos',
    'Pre-Seed',
    'Seed',
    'Série A',
    'Série B',
    'Série C+'
];

const StartupInvestorMap = () => {
    const [logos, setLogos] = useState([]);

    useEffect(() => {
        // Referência para a coleção 'investors'
        const investorsCollection = collection(db, 'investors');

        // Listener para investidores
        const unsubscribeInvestors = onSnapshot(investorsCollection, (snapshot) => {
            const investorsData = [];
            snapshot.forEach(doc => {
                investorsData.push({ id: doc.id, ...doc.data(), userType: 'investor' });
            });

            setLogos(investorsData);
        }, (error) => {
            console.error("Erro ao buscar logos de investidores:", error);
        });

        // Cleanup listener on unmount
        return () => {
            unsubscribeInvestors();
        };
    }, []);

    // Função para determinar a categoria do logo
    const determineCategory = (logo) => {
        if (logo.userType === 'investor' && logo.preferredStage) {
            return logo.preferredStage;
        }
        return null; // Não categorizado
    };

    // Função para filtrar logos por categoria
    const getLogosByCategory = (category) => {
        return logos.filter(logo => determineCategory(logo) === category);
    };

    // Debug: Verificar os dados das logos
    useEffect(() => {
        console.log("Investors Logos Carregadas:", logos);
    }, [logos]);

    return (
        <div className="startup-investor-map-container">
            {SECTIONS.map((section, index) => (
                <div key={index} className="section">
                    <h2 className="section-title">{section}</h2>
                    <div className="logo-grid">
                        {getLogosByCategory(section).map(logo => (
                            <div key={logo.id} className="logo-item">
                                <img src={logo.logoURL} alt={logo.name || 'Logo'} />
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
