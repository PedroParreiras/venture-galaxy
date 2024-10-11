// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import FounderPage from './pages/FounderPage';
import InvestorPage from './pages/InvestorPage';
import CompanyPage from './pages/CompanyPage';
import EntityForm from './components/Forms/EntityForm';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import ForgotPassword from './components/Auth/ForgotPassword';
import ImportInvestors from './pages/ImportInvestors'; // Importando o novo componente de importação de investidores

function AppRoutes() {
  const location = useLocation();
  // Define as rotas onde o Header não deve ser exibido
  const noHeaderRoutes = ['/login', '/signup', '/forgot-password'];

  return (
    <>
      {!noHeaderRoutes.includes(location.pathname) && <Header />} {/* Exibir Header condicionalmente */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Nova rota para ForgotPassword */}
        
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

        {/* Rota para Importar Investidores */}
        <Route
          path="/import-investors"
          element={
            <PrivateRoute>
              <ImportInvestors />
            </PrivateRoute>
          }
        />

      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
