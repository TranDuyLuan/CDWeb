import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/categoryListPage.css";

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await ApiService.getAllCategory();
      setCategories(response.categoryList || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="category-page-container">
      <h2 className="category-title">Danh mục sản phẩm</h2>

      {loading ? (
        <p>Đang tải danh mục...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : categories.length === 0 ? (
        <p>Không có danh mục nào được tìm thấy.</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="category-image-placeholder">
                {/* Nếu có image: <img src={category.imageUrl} alt={category.name} /> */}
                <span role="img" aria-label="Category">🛍️</span>
              </div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryListPage;
