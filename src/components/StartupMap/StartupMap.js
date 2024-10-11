// src/components/StartupMap/StartupMap.js

import React, { useEffect, useState } from 'react';
import './StartupMap.css';
import { db } from '../../firebase'; // Importa a instância do Firestore
import { collection, onSnapshot, doc, setDoc, increment } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

// Títulos das seções
const SECTIONS = [
    'Aceleração',
    'Anjo',
    'Pre-Seed',
    'Seed',
    'Série A',
    'Série B',
    'Série C+'
];

const StartupMap = () => {
    const [logos, setLogos] = useState([]);
    const { currentUser } = useAuth();

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

    // Função para lidar com o clique na logo
    const handleLogoClick = async (logoId) => {
        if (!currentUser) {
            console.error("Usuário não está logado");
            return;
        }

        const userId = currentUser.uid;
        const logoClickDocRef = doc(db, 'logoClicks', `${userId}_${logoId}`);

        try {
            await setDoc(logoClickDocRef, {
                userId: userId,
                logoId: logoId,
                count: increment(1)
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao atualizar o contador de cliques:", error);
        }
    };

    return (
        <div className="startup-map-container">
            {SECTIONS.map((section, index) => (
                <div key={index} className="section">
                    <h2 className="section-title">{section}</h2>
                    <div className="logo-grid">
                        {getLogosByCategory(section).map(logo => (
                            <div key={logo.id} className="logo-item" onClick={() => handleLogoClick(logo.id)}>
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
