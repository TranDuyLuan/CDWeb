import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import '../../style/productDetailsPage.css';

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { dispatch } = useCart();

    const [product, setProduct] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, content: "" });

    useEffect(() => {
        (async () => {
            await fetchProduct();
            await fetchReviews();
        })();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const { product } = await ApiService.getProductById(productId);
            setProduct(product);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error.message || error);
        }
    };

    const fetchReviews = async () => {
        try {
            const { reviews = [] } = await ApiService.getReviewsByProductId(productId);
            setReviews(reviews);
        } catch (error) {
            console.error("Lỗi khi tải đánh giá:", error.message || error);
        }
    };

    const handleAddToCart = () => {
        if (product && selectedQuantity > 0) {
            dispatch({ type: "ADD_ITEM", payload: { ...product, quantity: selectedQuantity } });
            alert(`Đã thêm ${selectedQuantity} sản phẩm vào giỏ hàng!`);
        }
    };

    const changeQuantity = (delta) => {
        setSelectedQuantity(prev => Math.max(1, prev + delta));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await ApiService.createReview({
                productId: Number(productId),
                content: newReview.content,
                rating: newReview.rating,
                userId: 1, // Tạm thời, gán cố định
            });
            setNewReview({ rating: 5, content: "" });
            fetchReviews();
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error.message || error);
        }
    };

    if (!product) return <p>Đang tải thông tin sản phẩm...</p>;

    return (
        <div className="product-detail-container">
            <div className="top-bar">
                <button className="back-button" onClick={() => navigate(-1)}>← Quay lại</button>
            </div>

            <div className="product-detail">
                <div className="product-left">
                    <img src={product.imageUrl} alt={product.name} />
                </div>

                <div className="product-right">
                    <h1>{product.name}</h1>
                    <p><strong>Tình trạng:</strong> ✅ Còn hàng</p>
                    <p><strong>Đánh giá:</strong> ⭐ {product.rating?.toFixed(1) || "Chưa có"} / 5</p>
                    <p className="description">{product.description}</p>

                    <div className="price-box">
                        <span className="current-price">{product.price.toLocaleString()} đ</span>
                        {product.originalPrice > product.price && (
                            <span className="old-price">{product.originalPrice.toLocaleString()} đ</span>
                        )}
                    </div>

                    <div className="quantity-controls">
                        <button onClick={() => changeQuantity(-1)}>-</button>
                        <span>{selectedQuantity}</span>
                        <button onClick={() => changeQuantity(1)}>+</button>
                    </div>

                    <button onClick={handleAddToCart} className="add-to-cart-btn">Thêm vào giỏ hàng</button>
                </div>
            </div>

            <hr />
            <div className="review-section">
                <h2>Đánh giá sản phẩm ({reviews.length})</h2>

                {reviews.length === 0 ? (
                    <p>Chưa có đánh giá nào.</p>
                ) : (
                    <div className="reviews-list">
                        {reviews.map(({ id, rating, content, created_at }) => (
                            <div key={id} className="review-item">
                                <p><strong>⭐ {rating}/5</strong></p>
                                <p>{content}</p>
                                <small>Ngày đăng: {new Date(created_at).toLocaleString()}</small>
                            </div>
                        ))}
                    </div>
                )}

                <form className="review-form" onSubmit={handleReviewSubmit}>
                    <h3>Thêm đánh giá của bạn</h3>
                    <label>
                        Số sao:
                        <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                        >
                            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                    <label>
                        Nội dung:
                        <textarea
                            value={newReview.content}
                            onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                            required
                        />
                    </label>
                    <button type="submit">Gửi đánh giá</button>
                </form>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
