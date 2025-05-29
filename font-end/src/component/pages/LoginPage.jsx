import React, { useState,useEffect,useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css'


const LoginPage = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState(null);
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.loginUser(formData);
            if (response.status === 200) {
                setMessage("User Successfully Loged in");
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                setTimeout(() => {
                    navigate("/")
                }, 1000)
            }
        } catch (error) {
            setMessage(error.response?.data.message || error.message || "unable to Login a user");
        }
    }
    // Xử lý token trả về từ Google Identity Services
    const handleGoogleResponse = useCallback(async (response) => {
        try {
            const res = await ApiService.loginWithGoogle({ token: response.credential });
            localStorage.setItem("token", res.token);
            localStorage.setItem("role", res.role);
            navigate("/");
        } catch (error) {
            setMessage("Google login failed");
        }
    }, [navigate]);

    // Khởi tạo Google Identity Services khi component mount
    useEffect(() => {
        /* global google */
        if (window.google) {
            google.accounts.id.initialize({
                client_id: "975530860641-264sfp01t88u8vkhdva2kh19aocdokge.apps.googleusercontent.com",
                callback: handleGoogleResponse,
            });
            google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                { theme: "outline", size: "large" }
            );
            // Nếu muốn hiển thị prompt tự động 1-tap sign-in:
            // google.accounts.id.prompt();
        }
    }, [handleGoogleResponse]);

    return (
        <div className="register-page">
            <h2>Login</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>Email: </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required/>

                <label>Password: </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required/>

                <button type="submit">Login</button>

                <p className="register-link">
                    Don't have an account? <a href="/register">Register</a>
                </p>
            </form>
            <div style={{marginTop: "20px"}}>
                <div id="googleSignInDiv"></div>
            </div>
        </div>
    )
}

export default LoginPage;