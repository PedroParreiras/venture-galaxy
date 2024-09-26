// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import FounderPage from './pages/FounderPage';
import InvestorPage from './pages/InvestorPage';
import CompanyPage from './pages/CompanyPage';
import EntityForm from './components/Forms/EntityForm';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard'; // Import Dashboard
import Header from './components/Header'; // Import Header

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header /> {/* Header will be displayed on all pages */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/founder-dashboard"
            element={
              <PrivateRoute>
                <FounderPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/investor-dashboard"
            element={
              <PrivateRoute>
                <InvestorPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/company/:companyId"
            element={
              <PrivateRoute>
                <CompanyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entity-form"
            element={
              <PrivateRoute>
                <EntityForm />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
