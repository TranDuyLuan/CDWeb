import React, { useEffect, useState } from "react";
import "../../style/userManage.css";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    //  Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllUsers();
            setUsers(res.userList || []);
            setMessage("");
        } catch (error) {
            setMessage("Lỗi khi tải danh sách người dùng.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa người dùng này?");
        if (!confirmDelete) return;

        try {
            await ApiService.deleteUser(id);
            setUsers(prev => prev.filter(user => user.id !== id));
            setMessage("Xóa người dùng thành công.");
        } catch (error) {
            console.error(error);
            setMessage("Xóa thất bại.");
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="user-management">
            <h2>Quản lý người dùng</h2>
            {message && <p className="message">{message}</p>}

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : users.length === 0 ? (
                <p>Không có người dùng nào.</p>
            ) : (
                <>
                    <table className="user-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phoneNumber}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button onClick={() => handleDelete(user.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>


                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default UserManagementPage;
