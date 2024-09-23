// src/components/Auth/Signup.js
import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const userTypeRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setError('');
      await signup(
        emailRef.current.value,
        passwordRef.current.value,
        userTypeRef.current.value
      );
      navigate('/');
    } catch (error) {
      setError('Falha ao criar a conta');
      console.error('Erro no cadastro:', error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Criar Conta</h2>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" ref={emailRef} required />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input type="password" ref={passwordRef} required />
          </div>

          <div className="form-group">
            <label>Tipo de Usuário:</label>
            <select ref={userTypeRef} required>
              <option value="">Selecione</option>
              <option value="founder">Founder</option>
              <option value="investor">Investor</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Cadastrar
          </button>
        </form>
        <p className="signup-footer">
          Já tem uma conta? <Link to="/login">Entre aqui</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
