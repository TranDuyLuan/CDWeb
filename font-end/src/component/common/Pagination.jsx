import React, { useState } from "react";
import '../../style/pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [inputPage, setInputPage] = useState('');

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleInputChange = (e) => {
        setInputPage(e.target.value);
    };

    const handleGoToPage = () => {
        const pageNumber = parseInt(inputPage);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
            setInputPage('');
        } else {
            alert(`Vui lòng nhập số từ 1 đến ${totalPages}`);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="pagination">
            <button onClick={goToPrevPage} disabled={currentPage === 1} className="nav-btn">
                «
            </button>

            {pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={number === currentPage ? 'active' : ''}
                >
                    {number}
                </button>
            ))}

            <button onClick={goToNextPage} disabled={currentPage === totalPages} className="nav-btn">
                »
            </button>

            <div className="goto-page">
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={inputPage}
                    onChange={handleInputChange}
                    placeholder="..."
                />
                <button onClick={handleGoToPage}>Đi</button>
            </div>
        </div>
    );
};

export default Pagination;
