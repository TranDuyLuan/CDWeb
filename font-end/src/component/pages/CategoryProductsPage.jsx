import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import "../../style/home.css";

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1); // reset page khi chuyển danh mục
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAllProductsByCategoryId(categoryId);
      const allProducts = response.productList || [];
      setCategoryName(response.categoryName || "Sản phẩm");
      setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
      setProducts(
        allProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể lấy sản phẩm theo danh mục"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : products.length === 0 ? (
        <p>Không có sản phẩm nào trong danh mục này.</p>
      ) : (
        <>
          <h2 className="category-title">Danh mục: {categoryName}</h2>
          <ProductList products={products} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </div>
  );
};

export default CategoryProductsPage;
