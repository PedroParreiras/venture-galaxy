import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import './Signup.css';

function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const userTypeRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setError('');
      // Create a new user with email, password, and user type
      const userCredential = await signup(
        emailRef.current.value,
        passwordRef.current.value,
        userTypeRef.current.value
      );

      if (userCredential && userCredential.user) {
        // Save the user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: emailRef.current.value,
          userType: userTypeRef.current.value,
        });

        // Show success popup (optional)
        setShowSuccessPopup(true);

        // Redirect to the dashboard immediately after successful signup
        navigate('/dashboard');
      }
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
              <option value="other">Other</option>
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

      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Conta criada com sucesso!</h3>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
