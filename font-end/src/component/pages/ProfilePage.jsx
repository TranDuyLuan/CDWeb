import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/profile.css';
import Pagination from "../common/Pagination";

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await ApiService.getLoggedInUserInfo();
            setUserInfo(response.user);
            setFormData({
                name: response.user.name || '',
                email: response.user.email || '',
                phoneNumber: response.user.phoneNumber || '',
            });
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to fetch user info');
        }
    };

    if (!userInfo) {
        return <div className="loading">Đang tải thông tin người dùng...</div>;
    }

    const handleAddressClick = () => {
        navigate(userInfo.address ? '/edit-address' : '/add-address');
    };
    const handleChangePassword = () => {
        navigate('/change-password');
    };

    // Xử lý form input thay đổi
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit form cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.updateUserInfo(formData);
            setUserInfo(response.user);
            setEditing(false);
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Update failed');
        }
    };

    const orderItemList = userInfo.orderItemList || [];
    const totalPages = Math.ceil(orderItemList.length / itemsPerPage);
    const paginatedOrders = orderItemList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="profile-page">
            <h2 className="section-title">Xin chào, {userInfo.name} 👋</h2>

            {error && <p className="error-message">{error}</p>}

            <div className="section profile-info">
                <h3>Thông tin cá nhân</h3>

                {editing ? (
                    <form onSubmit={handleSubmit} className="edit-form">
                        <label>
                            Họ tên:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Số điện thoại:
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                            />
                        </label>
                        <button type="submit" className="profile-button">Lưu thay đổi</button>
                        <button type="button" className="profile-button" onClick={() => setEditing(false)}>Hủy</button>
                    </form>
                ) : (
                    <>
                        <p><strong>Họ tên:</strong> {userInfo.name}</p>
                        <p><strong>Email:</strong> {userInfo.email}</p>
                        <p><strong>Số điện thoại:</strong> {userInfo.phoneNumber}</p>
                        <button className="profile-button" onClick={() => setEditing(true)}>
                            Chỉnh sửa thông tin
                        </button>
                        <button className="profile-button" onClick={handleChangePassword}>
                            Đổi mật khẩu
                        </button>
                    </>
                )}
            </div>

            <div className="section address-info">
                <h3>Địa chỉ</h3>
                {userInfo.address ? (
                    <div>
                        <p><strong>Đường:</strong> {userInfo.address.street}</p>
                        <p><strong>Thành phố:</strong> {userInfo.address.city}</p>
                        <p><strong>Tỉnh/Quận:</strong> {userInfo.address.state}</p>
                        <p><strong>Mã bưu điện:</strong> {userInfo.address.zipCode}</p>
                        <p><strong>Quốc gia:</strong> {userInfo.address.country}</p>
                    </div>
                ) : (
                    <p>Chưa có thông tin địa chỉ.</p>
                )}
                <button className="profile-button" onClick={handleAddressClick}>
                    {userInfo.address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
                </button>
            </div>

            <div className="section order-history">
                <h3>Lịch sử đơn hàng</h3>
                {orderItemList.length === 0 ? (
                    <p>Chưa có đơn hàng nào.</p>
                ) : (
                    <>
                        <ul className="order-list">
                            {paginatedOrders.map(order => (
                                <li key={order.id} className="order-card">
                                    <img src={order.product?.imageUrl} alt={order.product.name} />
                                    <div className="order-info">
                                        <p><strong>Sản phẩm:</strong> {order.product.name}</p>
                                        <p><strong>Số lượng:</strong> {order.quantity}</p>
                                        <p><strong>Giá:</strong> {order.price.toFixed(2)} VND</p>
                                        <p><strong>Trạng thái:</strong> {order.status}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
