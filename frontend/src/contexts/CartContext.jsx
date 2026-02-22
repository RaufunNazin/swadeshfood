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
  const [cart, setCart] = useState(() => safeReadCart());

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [cart]);

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // ✅ exact setter (best for live stock validation + checkout)
  const setQuantity = (productId, qty, stock) => {
    const maxQty = typeof stock === "number" ? stock : Infinity;
    const desired = Math.max(1, Math.min(Number(qty || 1), maxQty));

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: desired } : item,
      ),
    );
  };

  // ✅ +/- delta (good for cart UI buttons)
  const updateQuantity = (productId, delta, stock) => {
    const maxQty = typeof stock === "number" ? stock : Infinity;

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        const nextQty = Number(item.quantity || 1) + Number(delta || 0);
        const clampedQty = Math.max(1, Math.min(nextQty, maxQty));
        return { ...item, quantity: clampedQty };
      }),
    );
  };

  // ✅ clamp add-to-cart by stock if product has stock
  const addToCart = (product, qty = 1) => {
    const stock = typeof product.stock === "number" ? product.stock : Infinity;

    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.id === product.id);

      if (idx > -1) {
        const updated = [...prevCart];
        const current = Number(updated[idx].quantity || 1);
        const desired = Math.min(current + Number(qty || 1), stock);

        updated[idx] = { ...updated[idx], quantity: desired };
        return updated;
      }

      const initialQty = Math.max(1, Math.min(Number(qty || 1), stock));
      return [...prevCart, { ...product, quantity: initialQty }];
    });
  };

  const clearCart = () => setCart([]);

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
        setQuantity, // ✅ new
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

CartProvider.propTypes = { children: PropTypes.node };

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
