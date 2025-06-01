import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/profile.css';
import Pagination from "../common/Pagination";

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
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


    const orderItemList = userInfo.orderItemList || [];
    const totalPages = Math.ceil(orderItemList.length / itemsPerPage);
    const paginatedOrders = orderItemList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="profile-page">
            <h2 className="section-title">Xin chào, {userInfo.name} 👋</h2>

            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <>
                    <div className="section profile-info">
                        <h3>Thông tin cá nhân</h3>
                        <p><strong>Họ tên:</strong> {userInfo.name}</p>
                        <p><strong>Email:</strong> {userInfo.email}</p>
                        <p><strong>Số điện thoại:</strong> {userInfo.phoneNumber}</p>
                        <button className="profile-button" onClick={handleChangePassword}>
                            Đổi mật khẩu
                        </button>
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
                </>
            )}
        </div>
    );
};

export default ProfilePage;
