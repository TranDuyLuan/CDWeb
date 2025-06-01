import React, { useState } from "react";
import ApiService from "../../service/ApiService";

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
        <div>
            <h2>Change Password</h2>
            <form onSubmit={handleSubmit}>
                <input type="password" name="currentPassword" placeholder="Current Password" onChange={handleChange} />
                <input type="password" name="newPassword" placeholder="New Password" onChange={handleChange} />
                <button type="submit">Change</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ChangePasswordPage;
