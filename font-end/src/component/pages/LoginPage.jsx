/* global google */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    // Kiểm tra token khi tải trang
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log("Người dùng đã đăng nhập, chuyển hướng đến trang chủ");
            navigate("/");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.loginUser(formData);
            if (response.status === 200) {
                setMessage("Đăng nhập thành công");
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.role);
                localStorage.setItem('email', response.user.email);
                navigate("/");
            }
        } catch (error) {
            setMessage(error.response?.data.message || error.message || "Không thể đăng nhập");
        }
    };

    const handleGoogleResponse = useCallback(async (response) => {
        try {
            const res = await ApiService.loginWithGoogle({ token: response.credential });
            localStorage.setItem("token", res.token);
            localStorage.setItem("role", res.role);
            localStorage.setItem("email", res.user.email);
            setMessage("Đăng nhập Google thành công");
            navigate("/");
        } catch (error) {
            setMessage(error.response?.data?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
        }
    }, [navigate]);

    useEffect(() => {
        const initializeGoogle = () => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: "975530860641-264sfp01t88u8vkhdva2kh19aocdokge.apps.googleusercontent.com",
                    callback: handleGoogleResponse,
                    auto_select: false,
                    context: "signin",
                    use_fedcm_for_prompt: true
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignInDiv"),
                    { theme: "outline", size: "large" }
                );

                console.log("Google One Tap Sign-In");
            } else {
                console.warn("Google Identity Services chưa tải. Thử lại...");
                setTimeout(initializeGoogle, 100);
            }
        };

        initializeGoogle();
    }, [handleGoogleResponse]);

    return (
        <div className="register-page">
            <h2>Đăng nhập</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>Email: </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <label>Mật khẩu: </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Đăng nhập</button>
                <p className="register-link">
                    Chưa có tài khoản? <a href="/register">Đăng ký</a>
                </p>
            </form>
            <div style={{ marginTop: "20px" }}>
                <div id="googleSignInDiv"></div>
            </div>
        </div>
    );
};

export default LoginPage;