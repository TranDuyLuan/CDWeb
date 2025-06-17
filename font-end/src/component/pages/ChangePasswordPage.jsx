import React, { useState } from "react";
import ApiService from "../../service/ApiService";
import "../../style/changePassword.css";


const ChangePasswordPage = () => {
    const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await ApiService.changePassword(form);
            setMessage(res.message);
        } catch (err) {
            setMessage(err.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <div className="change-password-container">
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handleSubmit} className="change-password-form">
                <input
                    type="password"
                    name="currentPassword"
                    placeholder="Mật khẩu hiện tại"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="newPassword"
                    placeholder="Mật khẩu mới"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Xác nhận</button>
            </form>
            {message && <p className="change-password-message">{message}</p>}
        </div>
    );

};

export default ChangePasswordPage;
