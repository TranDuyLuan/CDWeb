import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/address.css';

const AddressPage = () => {
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const isEditMode = location.pathname === '/edit-address';

    useEffect(() => {
        if (isEditMode) {
            fetchUserInfo();
        }
    }, [location.pathname]);

    const fetchUserInfo = async () => {
        try {
            const response = await ApiService.getLoggedInUserInfo();
            if (response.user.address) {
                setAddress(response.user.address);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Unable to fetch user information");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ApiService.saveAddress(address);
            navigate("/profile");
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to save/update address");
        }
    };

    return (
        <div className="address-page">
            <div className="address-card">
                <h2>{isEditMode ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="address-form">
                    <div className="form-group">
                        <label>Đường:</label>
                        <input
                            type="text"
                            name="street"
                            value={address.street}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Thành phố:</label>
                        <input
                            type="text"
                            name="city"
                            value={address.city}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Tỉnh / Quận:</label>
                        <input
                            type="text"
                            name="state"
                            value={address.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mã bưu điện:</label>
                        <input
                            type="text"
                            name="zipCode"
                            value={address.zipCode}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Quốc gia:</label>
                        <input
                            type="text"
                            name="country"
                            value={address.country}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        {isEditMode ? 'Lưu thay đổi' : 'Lưu địa chỉ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddressPage;
