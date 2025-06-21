import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import '../../style/home.css';

const Home = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [newestProducts, setNewestProducts] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const queryparams = new URLSearchParams(location.search);
                const searchItem = queryparams.get("search");

                let allProducts = [];
                if (searchItem) {
                    const response = await ApiService.searchProducts(searchItem);
                    allProducts = response.productList || [];
                } else {
                    const response = await ApiService.getAllProducts();
                    allProducts = response.productList || [];
                }

                // Tách sản phẩm mới nhất
                const sortedByDate = [...allProducts].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setNewestProducts(sortedByDate.slice(0, 7));

                // Tách sản phẩm bán chạy
                const sortedBySold = [...allProducts].sort((a, b) => b.sold - a.sold);
                setBestSellingProducts(sortedBySold.slice(0, 7));

                // Phân trang cho tất cả sản phẩm
                setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
                setProducts(
                    allProducts.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                    )
                );

                setError(null);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch products"
                );
            }
            setLoading(false);
        };

        fetchData();
    }, [location.search, currentPage]);

    return (
  <div className="home">
    <div className="home-banner">
      <img src="/banner.png" alt="101 Mart Banner" />
    </div>

    {error ? (
      <p className="error-message">{error}</p>
    ) : loading ? (
      <p className="loading-message">Loading products...</p>
    ) : (
      <>
        {currentPage === 1 && (
          <>
            <h2 className="section-title">Newest Products</h2>
            <ProductList products={newestProducts} />

            <h2 className="section-title">Best Sellers</h2>
            <ProductList products={bestSellingProducts} />
          </>
        )}

        <h2 className="section-title">
          {location.search.includes("search=")
            ? "Search Results"
            : "All Products"}
        </h2>
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

export default Home;
