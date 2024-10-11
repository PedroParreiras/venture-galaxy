// src/components/Funnel/InvestorFunnel.js

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import './InvestorFunnel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CompanyCard from '../CompanyCard/CompanyCard';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import StartupImporter from '../StartupImporter/StartupImporter';
import Modal from 'react-modal';

function InvestorFunnel() {
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [founderEmail, setFounderEmail] = useState('');
  const [investorData, setInvestorData] = useState({});
  const { currentUser } = useAuth();
  const [classifiedData, setClassifiedData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileURL, setUploadedFileURL] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchInvestorData = async () => {
      if (currentUser) {
        try {
          const investorDocRef = doc(db, 'investors', currentUser.uid);
          const investorDocSnap = await getDoc(investorDocRef);
          if (investorDocSnap.exists()) {
            setInvestorData(investorDocSnap.data());
          } else {
            console.error('Investor data not found');
          }
        } catch (error) {
          console.error('Error fetching investor data:', error);
        }
      }
    };

    fetchInvestorData();
  }, [currentUser]);

  // Function to fetch startups from Firestore
  const fetchStartups = async () => {
    try {
      const companiesSnap = await getDocs(collection(db, 'founders'));
      const companiesData = companiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStartups(companiesData);
    } catch (error) {
      console.error('Error fetching startups:', error);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchFounderEmail = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setFounderEmail(userDoc.data().email);
      }
    } catch (error) {
      console.error('Error fetching founder email:', error);
    }
  };

  const handleStartupClick = (startup) => {
    setSelectedStartup(startup);
    if (startup.userId) {
      fetchFounderEmail(startup.userId);
    }
  };

  const handleBackClick = () => {
    setSelectedStartup(null);
    setFounderEmail('');
  };

  // Function to calculate match percentage
  const calculateWeightPercentage = (startup) => {
    let totalWeight = 0;
    const weights = {
      sector: 1,
      ticketSize: 1,
      revenue: 1,
      valuation: 1,
      revenueModel: 1,
      originState: 1,
      companyAge: 1,
      stage: 1,
    };
    const maxWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    const {
      sectorInterest = [],
      ticketSize = 1,
      preferredRevenue = 1,
      preferredValuation = 1,
      revenueIncome = [],
      originState = '',
      companieAge = 0,
      preferredStage = '',
    } = investorData;

    // Sector comparison
    if (sectorInterest.includes('Agnostic')) {
      totalWeight += weights.sector;
    } else if (startup.sector && sectorInterest.includes(startup.sector)) {
      totalWeight += weights.sector;
    }

    // Ticket Size comparison
    const ticketRatio = Math.min(ticketSize / (startup.valuation || 1), 1);
    totalWeight += ticketRatio * weights.ticketSize;

    // Revenue comparison
    const revenueRatio = Math.min((startup.annualRevenue || 0) / (preferredRevenue || 1), 1);
    totalWeight += revenueRatio * weights.revenue;

    // Valuation comparison
    const valuationRatio = Math.min(preferredValuation / (startup.valuation || 1), 1);
    totalWeight += valuationRatio * weights.valuation;

    // Revenue Model comparison
    if (revenueIncome.includes('Agnostic')) {
      totalWeight += weights.revenueModel;
    } else if (startup.revenueModel && revenueIncome.includes(startup.revenueModel)) {
      totalWeight += weights.revenueModel;
    }

    // Origin State comparison
    if (originState === 'Agnostic' || originState === '') {
      totalWeight += weights.originState;
    } else if (startup.originState && startup.originState === originState) {
      totalWeight += weights.originState;
    }

    // Company Age comparison
    const ageDifference = Math.abs((startup.companyAge || 0) - (companieAge || 0));
    const ageScore = ageDifference === 0 ? 1 : 1 / (ageDifference + 1);
    totalWeight += ageScore * weights.companyAge;

    // Stage comparison
    if (preferredStage === 'Agnostic' || preferredStage === '') {
      totalWeight += weights.stage;
    } else if (startup.stage && startup.stage === preferredStage) {
      totalWeight += weights.stage;
    }

    const percentage = (totalWeight / maxWeight) * 100;
    return percentage;
  };

  // Function to classify startups and upload the classified spreadsheet
  const classifyAndUploadStartups = async () => {
    if (startups.length === 0) {
      alert('No startups available to classify.');
      return;
    }

    // Assuming startups are already loaded in `startups` state
    const headers = [
      'Nome',
      'Setor',
      'Valuation',
      'Receita',
      'Modelo de Receita',
      'Estado de Origem',
      'Idade da Empresa',
      'Estágio',
      'MatchScore',
    ];
    const startupsData = startups.map((startup) => {
      const matchScore = calculateWeightPercentage(startup);
      return [
        startup.name || '',
        startup.sector || '',
        startup.valuation || '',
        startup.annualRevenue || '',
        startup.revenueModel || '',
        startup.originState || '',
        startup.companyAge || '',
        startup.stage || '',
        matchScore.toFixed(2) + '%',
      ];
    });

    const classifiedDataWithHeaders = [headers, ...startupsData];
    setClassifiedData(classifiedDataWithHeaders);

    // Convert to Excel spreadsheet
    const worksheet = XLSX.utils.aoa_to_sheet(classifiedDataWithHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Classificação');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Create a reference in Firebase Storage
    const fileName = `classified_startups_${currentUser.uid}_${Date.now()}.xlsx`;
    const storageRef = ref(storage, `classified_startups/${currentUser.uid}/${fileName}`);

    // Start the upload
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        setUploadError('Failed to upload classified spreadsheet.');
      },
      async () => {
        // Upload completed, get the download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedFileURL(downloadURL);
          setUploadSuccess(true);

          // Optionally: Save the URL in Firestore
          const investorDocRef = doc(db, 'investors', currentUser.uid);
          await updateDoc(investorDocRef, {
            lastClassifiedStartups: {
              url: downloadURL,
              timestamp: new Date(),
            },
          });

          // Reset upload progress
          setUploadProgress(0);
        } catch (error) {
          console.error('Error getting download URL:', error);
          setUploadError('Failed to get the URL of the classified spreadsheet.');
        }
      }
    );
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    // After closing the modal, fetch the startups again to include any new ones imported
    fetchStartups();
  };

  return (
    <div className="investor-funnel">
      {/* Modal for StartupImporter */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Import Startups"
        className="modal"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <button onClick={closeModal} className="close-modal-btn">
          &times;
        </button>
        <StartupImporter />
      </Modal>

      {/* Section for Import and Classification */}
      <div className="funnel-header">
        <h2>Startup Funnel</h2>
        <div className="funnel-actions">
          <button onClick={openModal} className="btn-secondary">
            Import Your Startups
          </button>
          <button onClick={classifyAndUploadStartups} className="btn-primary">
            Classify and Save to Firebase
          </button>
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <p>Uploading: {uploadProgress.toFixed(2)}%</p>
          <progress value={uploadProgress} max="100"></progress>
        </div>
      )}
      {uploadSuccess && (
        <div className="upload-success">
          <p>Classified spreadsheet saved successfully!</p>
          <a href={uploadedFileURL} target="_blank" rel="noopener noreferrer">
            Download Classified Spreadsheet
          </a>
        </div>
      )}
      {uploadError && <p className="error-message">{uploadError}</p>}

      {/* Selected Startup View */}
      {selectedStartup ? (
        <div className="selected-startup-view">
          <button className="back-button" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          {/* Display CompanyCard without editing */}
          <CompanyCard company={selectedStartup} onEdit={null} />
          {/* Display the founder's email */}
          {founderEmail && (
            <p className="contact-founder">
              Contact the founder: {founderEmail}
            </p>
          )}
        </div>
      ) : (
        <>
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
                    <p>Sector: {startup.sector}</p>
                    <p>Valuation: R$ {startup.valuation?.toLocaleString()}</p>
                    <p>Annual Revenue: R$ {startup.annualRevenue?.toLocaleString()}</p>
                    <p>Revenue Model: {startup.revenueModel}</p>
                    <p>Origin State: {startup.originState}</p>
                    <p>Company Age: {startup.companyAge} years</p>
                    <p>Stage: {startup.stage}</p>
                  </div>
                  <div className="startup-weight">
                    <FontAwesomeIcon icon={faStar} className="star-icon" />
                    <span>Score: {percentage.toFixed(2)}%</span>
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
