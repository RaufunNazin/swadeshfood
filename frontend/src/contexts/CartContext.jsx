import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const CartContext = createContext();

const safeReadCart = () => {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  // ✅ hydrate immediately (prevents the "write [] then read" wipe)
  const [cart, setCart] = useState(() => safeReadCart());

  // ✅ keep localStorage in sync AFTER cart is already hydrated
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      // ignore storage quota / private mode errors
      console.error("Failed to persist cart", e);
    }
  }, [cart]);

  const updateQuantity = (productId, delta, stock) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        const nextQty = (item.quantity || 1) + delta;
        const maxQty = typeof stock === "number" ? stock : Infinity;
        const clampedQty = Math.max(1, Math.min(nextQty, maxQty));

        return { ...item, quantity: clampedQty };
      }),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.id === product.id);
      if (idx > -1) {
        const updated = [...prevCart];
        updated[idx] = {
          ...updated[idx],
          quantity: (updated[idx].quantity || 1) + 1,
        };
        return updated;
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const clearCart = () => setCart([]);

  // Use memo so navbar/cart renders are stable
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + Number(item.price || 0) * (item.quantity || 0),
        0,
      ),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + (item.quantity || 0), 0),
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
