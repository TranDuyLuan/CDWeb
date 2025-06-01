import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.loginUser(formData);
            if (response.status === 200) {
                setMessage("User Successfully Logged in");
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }
        } catch (error) {
            setMessage(error.response?.data.message || error.message || "Unable to login");
        }
    };

    const handleForgotPassword = async () => {
        try {
            const response = await ApiService.forgotPassword({ email: forgotEmail });
            setMessage(response.message || "Password reset email sent.");
        } catch (error) {
            setMessage(error.response?.data.message || "Failed to send reset email.");
        }
    };

    return (
        <div className="register-page">
            <h2>Login</h2>
            {message && <p className="message">{message}</p>}

            {!showForgotPassword ? (
                <form onSubmit={handleSubmit}>
                    <label>Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password: </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">Login</button>

                    <p className="register-link">
                        <a href="#" onClick={() => setShowForgotPassword(true)}>Forgot Password?</a>
                    </p>

                    <p className="register-link">
                        Don't have an account? <a href="/register">Register</a>
                    </p>
                </form>
            ) : (
                <div>
                    <label>Enter your email to reset password:</label>
                    <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                    />
                    <button onClick={handleForgotPassword}>Send Reset Email</button>
                    <p>
                        <a href="#" onClick={() => setShowForgotPassword(false)}>Back to Login</a>
                    </p>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
