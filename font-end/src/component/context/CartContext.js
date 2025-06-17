import React, { createContext, useReducer, useContext, useEffect } from "react";

const CartContext = createContext();

const initialState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
};

const cartReducer = (state, action) => {
    let newCart;

    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.cart.find(item =>
                item.id === action.payload.id && item.size === action.payload.size
            );

            if (existingItem) {
                newCart = state.cart.map(item =>
                    item.id === action.payload.id && item.size === action.payload.size
                        ? { ...item, quantity: item.quantity + action.payload.quantity }
                        : item
                );
            } else {
                newCart = [...state.cart, { ...action.payload }];
            }

            return { ...state, cart: newCart };
        }

        case 'REMOVE_ITEM': {
            newCart = state.cart.filter(item =>
                !(item.id === action.payload.id && item.size === action.payload.size)
            );
            return { ...state, cart: newCart };
        }

        case 'INCREMENT_ITEM': {
            newCart = state.cart.map(item =>
                item.id === action.payload.id && item.size === action.payload.size
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            return { ...state, cart: newCart };
        }

        case 'DECREMENT_ITEM': {
            newCart = state.cart
                .map(item =>
                    item.id === action.payload.id && item.size === action.payload.size
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter(item => item.quantity > 0);
            return { ...state, cart: newCart };
        }

        case 'CLEAR_CART':
            return { ...state, cart: [] };

        default:
            return state;
    }
};


export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.cart));
    }, [state.cart]);

    return (
        <CartContext.Provider value={{ cart: state.cart, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
