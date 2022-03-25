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

  const getStockQuantity = async (productId: number) => {
    try {
      const response = await api.get(`/stock/${productId}`);
      return response.data.amount;
    } catch (err: any) {
      throw err;
    }
  };

  const saveCartToLocalStorage = (updatedCart: Array<object>) => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
  };

  class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  }

  const addProduct = async (productId: number) => {
    try {
      const stockQuantity = await getStockQuantity(productId);

      if (stockQuantity > 0) {
        const productAlreadyAddedtoCart = cart.some(
          (item) => item.id === productId
        );

        if (productAlreadyAddedtoCart) {
          updateProductAmount({
            productId: productId,
            amount: 1,
          });
        } else {
          const response = await api.get(`/products/${productId}`);
          let responseData = response.data;
          responseData.amount = 1;
          const updatedCart = [...cart, responseData];
          setCart(updatedCart);
          saveCartToLocalStorage(updatedCart);
        }
      } else if (stockQuantity === 0) {
        throw new ValidationError('Quantidade solicitada fora de estoque');
      }
    } catch (err: any) {
      if (err instanceof ValidationError) {
        toast.error(err.message);
      } else {
        toast.error('Erro na adição do produto');
      }
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // Verificar se tem produto no carrinho
      // Remover o produto do cart
      // Remover do produto do localstorage
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      let products = [...cart];
      const productIndex = products.findIndex(
        (product) => product.id === productId
      );
      products[productIndex].amount = amount;
      const updatedCart = [...products];
      setCart(updatedCart);
      saveCartToLocalStorage(updatedCart);
    } catch (err: any) {
      toast.error(err.message);
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
