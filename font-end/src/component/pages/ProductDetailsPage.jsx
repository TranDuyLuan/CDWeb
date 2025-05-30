import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import '../../style/productDetailsPage.css';

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { cart, dispatch } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const response = await ApiService.getProductById(productId);
            setProduct(response.product);
        } catch (error) {
            console.log(error.message || error);
        }
    };

    const addToCart = () => {
        if (product && selectedQuantity > 0) {
            dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity: selectedQuantity } });
            alert(`Đã thêm ${selectedQuantity} sản phẩm vào giỏ hàng!`);
        }
    };

    const incrementItem = () => {
        setSelectedQuantity(prev => prev + 1);
    };

    const decrementItem = () => {
        setSelectedQuantity(prev => (prev > 1 ? prev - 1 : 1));
    };

    if (!product) {
        return <p>Đang tải thông tin sản phẩm...</p>;
    }

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
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="old-price">{product.originalPrice.toLocaleString()} đ</span>
                        )}
                    </div>

                    {/* Tăng/giảm số lượng muốn mua */}
                    <div className="quantity-controls">
                        <button onClick={decrementItem}>-</button>
                        <span>{selectedQuantity}</span>
                        <button onClick={incrementItem}>+</button>
                    </div>

                    <button onClick={addToCart} className="add-to-cart-btn">Thêm vào giỏ hàng</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
