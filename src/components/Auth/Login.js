// src/components/Auth/Login.js
import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, loginWithGoogle, userData } = useAuth(); // Importando userData
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError('');
      await login(emailRef.current.value, passwordRef.current.value);
      // A navegação será tratada no useEffect
    } catch (error) {
      setError('Falha ao fazer login');
      console.error('Erro no login:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      // A navegação será tratada no useEffect
    } catch (error) {
      setError('Falha ao fazer login com o Google');
      console.error('Erro no login com o Google:', error);
    }
  };

  useEffect(() => {
    // Redirecionar o usuário baseado no tipo após o login
    if (userData) {
      if (userData.userType === 'founder') {
        navigate('/founder');
      } else if (userData.userType === 'investor') {
        navigate('/investor');
      } else {
        navigate('/'); // Redireciona para a página padrão se o tipo for desconhecido
      }
    }
  }, [userData, navigate]);

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Entrar</h2>
        {error && <div className="alert">{error}</div>}
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



        <p className="login-footer">
          Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
