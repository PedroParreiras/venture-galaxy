// src/components/StartupInvestorMap/StartupInvestorMap.js
import React, { useEffect, useState } from 'react';
import './StartupInvestorMap.css';
import { db } from '../../firebase'; // Importa a instância do Firestore
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';

const SECTIONS = [
    'Aceleração',
    'Anjo',
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
            // Assegure-se de que 'preferredStage' corresponde exatamente aos títulos das seções
            return SECTIONS.includes(logo.preferredStage) ? logo.preferredStage : null;
        }
        return null; // Não categorizado
    };

    // Função para filtrar logos por categoria
    const getLogosByCategory = (category) => {
        return logos.filter(logo => determineCategory(logo) === category);
    };

    // Função para lidar com o clique no logo
    const handleLogoClick = async (logo) => {
        if (logo.website) {
            try {
                const docRef = doc(db, 'investors', logo.id);
                await updateDoc(docRef, {
                    interactionCount: increment(1)
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
                        {getLogosByCategory(section).map(logo => (
                            <div
                                key={logo.id}
                                className="logo-item"
                                onClick={() => handleLogoClick(logo)}
                                title={logo.website ? 'Clique para visitar o site' : ''}
                                style={{ cursor: logo.website ? 'pointer' : 'default' }}
                            >
                                {logo.logoURL ? (
                                    <img src={logo.logoURL} alt={logo.name || 'Logo'} />
                                ) : (
                                    <div className="logo-placeholder">Logo</div>
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
