import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import '../../style/productList.css';

// Hàm lấy size, mặc định là "XL"
const getSafeSize = (product) => {
    return (product.size?.name || product.size || "XL").toUpperCase();
};

const ProductList = ({ products }) => {
    const { cart, dispatch } = useCart();

    const addToCart = (product) => {
        const size = getSafeSize(product);
        dispatch({
            type: "ADD_ITEM",
            payload: { ...product, size, quantity: 1 }
        });
    };

    const incrementItem = (product) => {
        const size = getSafeSize(product);
        dispatch({
            type: "INCREMENT_ITEM",
            payload: { ...product, size }
        });
    };

    const decrementItem = (product) => {
        const size = getSafeSize(product);
        const cartItem = cart.find(
            (item) => item.id === product.id && item.size === size
        );

        if (cartItem && cartItem.quantity > 1) {
            dispatch({
                type: "DECREMENT_ITEM",
                payload: { ...product, size }
            });
        } else {
            dispatch({
                type: "REMOVE_ITEM",
                payload: { ...product, size }
            });
        }
    };

    return (
        <div className="product-list">
            {products.map((product, index) => {
                const size = getSafeSize(product);
                const cartItem = cart.find(
                    (item) => item.id === product.id && item.size === size
                );

                return (
                    <div className="product-item" key={index}>
                        <Link to={`/product/${product.id}`}>
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="product-image"
                            />
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p className="default-size">Size: {size}</p>
                            <span>{product.price.toLocaleString('vi-VN')} đ</span>
                        </Link>

                        {cartItem ? (
                            <div className="quantity-controls-wrapper">
                                <div className="quantity-controls">
                                    <button onClick={() => decrementItem(product)}>-</button>
                                    <span>{cartItem.quantity}</span>
                                    <button onClick={() => incrementItem(product)}>+</button>
                                </div>
                                <p className="total-price">
                                    Total: ${(product.price * cartItem.quantity).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        ) : (
                            <button onClick={() => addToCart(product)}>
                                Add To Cart
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ProductList;
