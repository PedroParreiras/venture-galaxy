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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
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
          {/* Outras rotas */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
