// src/components/Auth/Login.js
import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, userData } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError('');
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/dashboard'); // Redireciona para o Dashboard após o login
    } catch (error) {
      setError('Falha ao fazer login');
      console.error('Erro no login:', error);
    }
  };

  useEffect(() => {
    // Redirecionar o usuário para o Dashboard se estiver logado
    if (userData) {
      navigate('/dashboard');
    }
  }, [userData, navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Entrar</h2>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" ref={emailRef} required />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input type="password" ref={passwordRef} required />
          </div>

          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
        </form>

        <div className="additional-links">
          <p className="forgot-password-link">
            <Link to="/forgot-password">Esqueceu sua senha?</Link>
          </p>
          <p className="login-footer">
            Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
