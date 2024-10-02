// src/components/Auth/ForgotPassword.js
import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
    const emailRef = useRef();
    const { resetPassword } = useAuth();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(emailRef.current.value);
            setMessage('Verifique seu email para redefinir a senha.');
        } catch (error) {
            setError('Falha ao tentar redefinir a senha.');
            console.error('Erro na redefinição de senha:', error);
        }

        setLoading(false);
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-form">
                <h2>Redefinir Senha</h2>
                {error && <div className="alert error">{error}</div>}
                {message && <div className="alert success">{message}</div>}
                <form onSubmit={handleResetPassword}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" ref={emailRef} required placeholder="Digite seu email" />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        Redefinir Senha
                    </button>
                </form>
                <p className="forgot-password-footer">
                    <Link to="/login">Voltar ao Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
