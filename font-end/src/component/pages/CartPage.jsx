import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import '../../style/cart.css';
import Swal from 'sweetalert2';

const CartPage = () => {
    const { cart, dispatch } = useCart();
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const incrementItem = (product) => {
        dispatch({ type: 'INCREMENT_ITEM', payload: product });
    };
const decrementItem = (product) => {
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem && cartItem.quantity > 1) {
        dispatch({ type: 'DECREMENT_ITEM', payload: product });
    } else {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to remove this item from your cart?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch({ type: 'REMOVE_ITEM', payload: product });
            }
        });
    }
};


    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (!ApiService.isAuthenticated()) {
            setMessage("You need to login first before placing an order.");
            setTimeout(() => {
                setMessage('');
                navigate("/login");
            }, 3000);
            return;
        }

        const orderItems = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));

        const orderRequest = {
            totalPrice,
            items: orderItems,
        };

        try {
            const response = await ApiService.createOrder(orderRequest);
            setMessage(response.message);

            if (response.status === 200) {
                dispatch({ type: 'CLEAR_CART' });
            }

            setTimeout(() => setMessage(''), 5000);

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Failed to place an order');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="cart-page">
            <h1>Your Shopping Cart</h1>
            {message && <p className="response-message">{message}</p>}

            {cart.length === 0 ? (
                <p className="empty-cart">Your cart is currently empty.</p>
            ) : (
                <div className="cart-container">
                    <ul className="cart-items">
                        {cart.map(item => (
                            <li key={item.id} className="cart-item">
                                <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <div className="quantity-controls">
                                        <button onClick={() => decrementItem(item)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => incrementItem(item)}>+</button>
                                    </div>
                                    <p className="item-total">Item Total: ${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-summary">
                        <h2>Total: ${totalPrice.toFixed(2)}</h2>
                        <button className="checkout-button" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
