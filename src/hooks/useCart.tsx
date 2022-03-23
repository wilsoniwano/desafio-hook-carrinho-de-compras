import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { ProductList } from '../pages/Home/styles';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productExists = cart.some((item) => item.id === productId);

      console.log(`exists? ${productExists}, productId: ${productId}`);

      if (productExists) {
        let products = [...cart];
        const productIndex = products.findIndex(
          (product) => product.id === productId
        );
        products[productIndex].amount++;
        const updatedCart = [...products];
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      } else {
        await api.get(`/products/${productId}`).then((response) => {
          let responseData = response.data;
          responseData.amount = 1;
          const updatedCart = [...cart, responseData];
          setCart(updatedCart);
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify(updatedCart)
          );
        });
      }
      const localStorageData = localStorage.getItem('@RocketShoes:cart');
      console.log(localStorageData);
      console.log(cart);
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
