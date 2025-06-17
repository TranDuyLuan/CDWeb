import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/register.css";

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const navigate = useNavigate();

    const handleGoogleResponse = useCallback(async (response) => {
        const idToken = response.credential;
        try {
            const res = await ApiService.loginUserWithGoogle(idToken);
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.role);
            setMessage("Login thành công với Google");
            setTimeout(() => navigate("/"), 1000);
        } catch (error) {
            setMessage("Đăng nhập Google thất bại");
        }
    }, [navigate]);

    const handleFacebookLogin = () => {
        window.FB.login(response => {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                loginWithFacebook(accessToken);
            } else {
                setMessage("Facebook login failed");
            }
        }, { scope: 'public_profile,email' });
    };

    const loginWithFacebook = async (accessToken) => {
        try {
            const response = await ApiService.loginUserWithFacebook(accessToken);
            localStorage.setItem("token", response.token);
            localStorage.setItem("role", response.role);
            setMessage("Login thành công với Facebook");
            setTimeout(() => navigate("/"), 1000);
        } catch (err) {
            console.error("Lỗi Facebook login:", err);
            setMessage("Login Facebook thất bại");
        }
    };

    useEffect(() => {
        // Google SDK
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: "975530860641-264sfp01t88u8vkhdva2kh19aocdokge.apps.googleusercontent.com",
                callback: handleGoogleResponse
            });
        }

        // Facebook SDK init
        const fbInitInterval = setInterval(() => {
            if (window.FB && typeof window.FB.init === 'function') {
                clearInterval(fbInitInterval);
                window.FB.init({
                    appId: '1043108134585670',
                    cookie: true,
                    xfbml: true,
                    version: 'v17.0'
                });
            }
        }, 100);

        return () => clearInterval(fbInitInterval);
    }, [handleGoogleResponse]);

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
                setTimeout(() => navigate("/"), 1000);
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

    const handleGoogleClick = () => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        } else {
            alert("Google SDK chưa được tải đúng.");
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

                    <div className="social-login">
                        <button className="social-btn facebook" onClick={handleFacebookLogin}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Fb" />
                            Facebook
                        </button>

                        <button className="social-btn google" onClick={handleGoogleClick}>
                            <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" />
                            Google
                        </button>
                    </div>

                    <p className="register-link">
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setShowForgotPassword(true)}
                        >
                            Forgot Password?
                        </button>
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
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setShowForgotPassword(false)}
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
