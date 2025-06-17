import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import "../../style/home.css";

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");

  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    applyFilters();
  }, [allProducts, searchQuery, sortOption, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAllProductsByCategoryId(categoryId);
      const fetched = response.productList || [];
      setCategoryName(response.categoryName || "Sản phẩm");
      setAllProducts(fetched);
    } catch (error) {
      setError(
          error.response?.data?.message || error.message || "Không thể lấy sản phẩm theo danh mục"
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortOption) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    const total = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    setTotalPages(total);
    setProducts(paginated);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
      <div className="home">
        {loading ? (
            <p>Đang tải sản phẩm...</p>
        ) : error ? (
            <p className="error-message">{error}</p>
        ) : (
            <>
              <h2 className="category-title">Danh mục: {categoryName}</h2>

              <div className="product-page-layout">
                {/* Sidebar bên trái */}
                <aside className="sidebar-filter">
                  <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                  />
                  <select
                      value={sortOption}
                      onChange={(e) => {
                        setSortOption(e.target.value);
                        setCurrentPage(1);
                      }}
                  >
                    <option value="name-asc">Tên A → Z</option>
                    <option value="name-desc">Tên Z → A</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                  </select>
                </aside>

                {/* Sản phẩm bên phải */}
                <section className="product-area">
                  {products.length === 0 ? (
                      <p>Không có sản phẩm nào phù hợp.</p>
                  ) : (
                      <>
                        <ProductList products={products} />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                      </>
                  )}
                </section>
              </div>
            </>
        )}
      </div>
  );
};

export default CategoryProductsPage;
