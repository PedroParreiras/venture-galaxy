// src/components/StartupMap/StartupMap.js
import React, { useEffect, useState } from 'react';
import './StartupMap.css';
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

const StartupMap = () => {
    const [logos, setLogos] = useState([]);

    useEffect(() => {
        // Referência para a coleção 'companies'
        const companiesCollection = collection(db, 'companies');

        // Listener para companies
        const unsubscribeCompanies = onSnapshot(companiesCollection, (snapshot) => {
            const companiesData = [];
            snapshot.forEach(doc => {
                companiesData.push({ id: doc.id, ...doc.data(), userType: 'company' });
            });

            setLogos(companiesData);
        }, (error) => {
            console.error("Erro ao buscar logos de startups:", error);
        });

        // Cleanup listener on unmount
        return () => {
            unsubscribeCompanies();
        };
    }, []);

    // Função para determinar a categoria do logo
    const determineCategory = (logo) => {
        if (logo.userType === 'company' && logo.stage) {
            return logo.stage;
        }
        return null; // Não categorizado
    };

    // Função para filtrar logos por categoria
    const getLogosByCategory = (category) => {
        return logos.filter(logo => determineCategory(logo) === category);
    };

    // Debug: Verificar os dados das logos
    useEffect(() => {
        console.log("Companies Logos Carregadas:", logos);
    }, [logos]);

    return (
        <div className="startup-map-container">
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

export default StartupMap;
