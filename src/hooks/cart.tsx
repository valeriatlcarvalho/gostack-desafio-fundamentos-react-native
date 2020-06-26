import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const localProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (localProducts) {
        const cartProducts = JSON.parse(localProducts);
        setProducts(cartProducts);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const findIndexProduct = products.findIndex(p => p.id === product.id);

      if (findIndexProduct === -1) {
        const cartAddItems = [...products, { ...product, quantity: 1 }];
        setProducts(cartAddItems);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(cartAddItems),
        );
      } else {
        const cartItem = {
          ...products[findIndexProduct],
          quantity: Number(products[findIndexProduct].quantity) + 1,
        };
        const filteredItems = products.filter(
          p => p.id !== products[findIndexProduct].id,
        );
        const cartUpdateItems = [...filteredItems, cartItem];
        setProducts(cartUpdateItems);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(cartUpdateItems),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const findIndexProduct = products.findIndex(p => p.id === id);
      if (findIndexProduct >= 0) {
        setProducts(
          products.map(p => ({
            ...p,
            quantity: p.id === id ? p.quantity + 1 : p.quantity,
          })),
        );
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(
            products.map(p => ({
              ...p,
              quantity: p.id === id ? p.quantity + 1 : p.quantity,
            })),
          ),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const findIndexProduct = products.findIndex(p => p.id === id);
      if (findIndexProduct >= 0) {
        if (products[findIndexProduct].quantity === 1) {
          setProducts(products.filter(p => p.id !== id));
          await AsyncStorage.setItem(
            '@GoMarketplace:products',
            JSON.stringify(products.filter(p => p.id !== id)),
          );
        } else {
          setProducts(
            products.map(p => ({
              ...p,
              quantity: p.id === id ? p.quantity - 1 : p.quantity,
            })),
          );
          await AsyncStorage.setItem(
            '@GoMarketplace:products',
            JSON.stringify(
              products.map(p => ({
                ...p,
                quantity: p.id === id ? p.quantity - 1 : p.quantity,
              })),
            ),
          );
        }
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
