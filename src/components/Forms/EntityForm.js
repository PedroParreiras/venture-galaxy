import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase'; // Removed unused `auth` import
import { useAuth } from '../../contexts/AuthContext';
import './EntityForm.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage functions

function EntityForm({ entity, onSubmit, onCancel }) {
  const { currentUser } = useAuth();

  // States for form fields
  const [entityName, setEntityName] = useState('');
  const [sectorInterest, setSectorInterest] = useState([]);
  const [aum, setAum] = useState('');
  const [ticketSize, setTicketSize] = useState('');
  const [dryPowder, setDryPowder] = useState('');
  const [preferredStage, setPreferredStage] = useState('');
  const [preferredRevenue, setPreferredRevenue] = useState('');
  const [preferredValuation, setPreferredValuation] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoURL, setLogoURL] = useState('');
  const [website, setWebsite] = useState(''); // New state for website
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Sector and stage options
  const sectorOptions = [
    'Agnostic', 'Adtech', 'Agtech', 'Biotech', 'Cannabis', 'Cibersecurity', 'Cleantech',
    'Construtech', 'Datatech', 'Deeptech', 'Ecommerce', 'Edtech', 'Energytech', 'ESG',
    'Femtech', 'Fintech', 'Foodtech', 'Games', 'Govtech', 'Healthtech', 'HRtech', 'Indtech',
    'Insurtech', 'Legaltech', 'Logtech', 'MarketPlaces', 'Martech', 'Nanotech', 'Proptech',
    'Regtech', 'Retailtech', 'Socialtech', 'Software', 'Sporttech', 'Web3', 'Space'
  ];

  const stageOptions = [
    'Aceleração', 'Anjo', 'Pre-Seed', 'Seed', 'Série A', 'Série B', 'Série C', 'Pre-IPO'
  ];

  // Fetch entity data from Firestore
  useEffect(() => {
    const fetchEntityData = async () => {
      if (currentUser && entity) {
        try {
          const docRef = doc(db, 'investors', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setEntityName(data.name || '');
            setSectorInterest(data.sectorInterest || []);
            setAum(data.aum?.toString() || '');
            setTicketSize(data.ticketSize?.toString() || '');
            setDryPowder(data.dryPowder?.toString() || '');
            setPreferredStage(data.preferredStage || '');
            setPreferredRevenue(data.preferredRevenue?.toString() || '');
            setPreferredValuation(data.preferredValuation?.toString() || '');
            setLogoURL(data.logoURL || '');
            setWebsite(data.website || ''); // Pre-fill website if available
          }
        } catch (error) {
          console.error('Error fetching investor data:', error);
          setError('Failed to load data. Please try again later.');
        }
      }
    };
    fetchEntityData();
  }, [currentUser, entity]);

  // Handle logo upload to Firebase Storage
  const handleLogoUpload = () => {
    return new Promise((resolve, reject) => {
      if (!logo) resolve('');

      const fileName = `${Date.now()}_${logo.name}`;
      const storageRef = ref(storage, `logos/${currentUser.uid}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, logo);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Logo upload failed'));
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let uploadedLogoURL = logoURL;

    if (logo) {
      try {
        uploadedLogoURL = await handleLogoUpload();
        setLogoURL(uploadedLogoURL);
      } catch (error) {
        setError('Failed to upload logo. Try again.');
        return;
      }
    }

    const data = {
      name: entityName,
      sectorInterest,
      aum: parseFloat(aum),
      ticketSize: parseFloat(ticketSize),
      dryPowder: parseFloat(dryPowder),
      preferredStage,
      preferredRevenue: parseFloat(preferredRevenue),
      preferredValuation: parseFloat(preferredValuation),
      logoURL: uploadedLogoURL || '',
      website, // Include website in saved data
      allowedEditors: [currentUser.uid],
    };

    try {
      await setDoc(doc(db, 'investors', currentUser.uid), data, { merge: true });
      onSubmit(data); // Pass updated data to the parent component
      setUploadProgress(0);
      setLogo(null);
    } catch (error) {
      console.error('Error saving entity data:', error);
      setError('Error saving data. Try again.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setLogo(e.target.files[0]);
  };

  return (
    <div className="entity-form-container">
      <form onSubmit={handleSubmit}>
        {/* Logo Upload */}
        <div className="form-group">
          <label>Entity Logo:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {logoURL && <img src={logoURL} alt="Entity Logo" className="preview-image" />}
        </div>

        {/* Entity Name */}
        <div className="form-group">
          <label>Entity Name:</label>
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            required
          />
        </div>

        {/* Website */}
        <div className="form-group">
          <label>Website:</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </div>

        {/* Sector Interest */}
        <div className="form-group">
          <label>Sector Interest:</label>
          <div className="checkbox-group">
            {sectorOptions.map((option) => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={sectorInterest.includes(option)}
                  onChange={(e) => {
                    const { value, checked } = e.target;
                    setSectorInterest(checked ? [...sectorInterest, value] : sectorInterest.filter(item => item !== value));
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* AUM */}
        <div className="form-group">
          <label>AUM (Assets Under Management):</label>
          <input
            type="number"
            value={aum}
            onChange={(e) => setAum(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Ticket Size */}
        <div className="form-group">
          <label>Ticket Size:</label>
          <input
            type="number"
            value={ticketSize}
            onChange={(e) => setTicketSize(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Dry Powder */}
        <div className="form-group">
          <label>Dry Powder:</label>
          <input
            type="number"
            value={dryPowder}
            onChange={(e) => setDryPowder(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Preferred Stage */}
        <div className="form-group">
          <label>Preferred Stage:</label>
          <select
            value={preferredStage}
            onChange={(e) => setPreferredStage(e.target.value)}
            required
          >
            <option value="">Select</option>
            {stageOptions.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Revenue */}
        <div className="form-group">
          <label>Preferred Annual Revenue:</label>
          <input
            type="number"
            value={preferredRevenue}
            onChange={(e) => setPreferredRevenue(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Preferred Valuation */}
        <div className="form-group">
          <label>Preferred Valuation:</label>
          <input
            type="number"
            value={preferredValuation}
            onChange={(e) => setPreferredValuation(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Save Button */}
        <div className="form-buttons">
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <p>Upload in progress: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100"></progress>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default EntityForm;
