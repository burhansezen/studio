'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductFormValues } from '@/app/(main)/inventory/add-product-form';
import { useRouter } from 'next/navigation';
import { products as initialProducts, transactions as initialTransactions } from '@/lib/data';

type GroupedTransactions = {
  [date: string]: Transaction[];
};

type ProductCount = {
  productName: string;
  count: number;
};

type User = {
    email: string;
}

type AppContextType = {
  user: User | null;
  isUserLoading: boolean;
  products: Product[];
  transactions: Transaction[];
  loading: {
    products: boolean;
    transactions: boolean;
  };
  summaryData: SummaryCardData[];
  totalStock: number;
  groupedTransactions: GroupedTransactions;
  topSellingProducts: ProductCount[];
  topReturningProducts: ProductCount[];
  addProduct: (productData: ProductFormValues) => Promise<void>;
  updateProduct: (productId: string, productData: ProductFormValues) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  makeSale: (product: Product) => Promise<void>;
  makeReturn: (product: Product) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState({ products: true, transactions: true });
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
        setProducts(initialProducts.sort((a,b) => new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime()));
        setTransactions(initialTransactions.sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
        setLoading({ products: false, transactions: false });
    }, 500);

    // Simulate checking auth status
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setIsUserLoading(false);

  }, []);
  
  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);
  
  const summaryData = useMemo(() => {
    const totalRevenue = transactions.filter(t => t.type === 'Satış').reduce((sum, t) => sum + t.amount, 0);
    const totalReturns = transactions.filter(t => t.type === 'İade').reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalRevenue + totalReturns;

    const totalProfit = transactions
      .filter(t => t.type === 'Satış')
      .reduce((sum, t) => {
        const product = products.find(p => p.id === t.productId);
        if (product) {
          const profitPerItem = product.sellingPrice - product.purchasePrice;
          return sum + (profitPerItem * t.quantity);
        }
        return sum;
      }, 0);

    return [
      { title: 'Net Gelir', value: `₺${netIncome.toLocaleString('tr-TR')}`, change: '', icon: DollarSign },
      { title: 'Toplam Kâr', value: `₺${totalProfit.toLocaleString('tr-TR')}`, change: '', icon: TrendingUp },
      { title: 'Satışlar', value: `+₺${totalRevenue.toLocaleString('tr-TR')}`, change: '', icon: ShoppingBag },
      { title: 'İadeler', value: `₺${totalReturns.toLocaleString('tr-TR')}`, change: '', icon: ArrowLeftRight },
    ];
  }, [transactions, products]);

  const groupedTransactions = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.dateTime).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as GroupedTransactions);
  }, [transactions]);

  const topSellingProducts = useMemo(() => {
    const sales = transactions.filter(t => t.type === 'Satış');
    const productCounts = sales.reduce((acc, sale) => {
      acc[sale.productName] = (acc[sale.productName] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productCounts)
      .map(([productName, count]) => ({ productName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [transactions]);

  const topReturningProducts = useMemo(() => {
    const returns = transactions.filter(t => t.type === 'İade');
    const productCounts = returns.reduce((acc, ret) => {
      acc[ret.productName] = (acc[ret.productName] || 0) + ret.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productCounts)
      .map(([productName, count]) => ({ productName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [transactions]);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  }

  const addProduct = async (productData: ProductFormValues) => {
    try {
      let imageUrl = 'https://placehold.co/400x300';
      if (productData.image && productData.image.length > 0) {
        imageUrl = await getBase64(productData.image[0]);
      }
      
      const { image, ...rest } = productData;

      const newProduct: Product = {
        ...rest,
        id: `prod_${Date.now()}`,
        imageUrl,
      };

      setProducts(prev => [newProduct, ...prev]);

      toast({
        title: "Ürün Eklendi",
        description: `${productData.name} başarıyla eklendi.`,
      });
    } catch (error) {
      console.error("Error adding product: ", error);
      toast({
        title: "Hata",
        description: "Ürün eklenirken bir hata oluştu.",
        variant: 'destructive',
      });
    }
  };

  const updateProduct = async (productId: string, productData: ProductFormValues) => {
    try {
      let imageUrl: string | undefined = undefined;
      if (productData.image && productData.image.length > 0) {
        imageUrl = await getBase64(productData.image[0]);
      }
      
      const { image, ...rest } = productData;

      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
            const updatedProduct: Product = {
                ...p,
                ...rest
            };
            if(imageUrl) {
                updatedProduct.imageUrl = imageUrl;
            }
            return updatedProduct;
        }
        return p;
      }));

      toast({
        title: "Ürün Güncellendi",
        description: `${productData.name} başarıyla güncellendi.`,
      });
    } catch (error) {
      console.error("Error updating product: ", error);
      toast({
        title: "Hata",
        description: "Ürün güncellenirken bir hata oluştu.",
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;
    
    setProducts(prev => prev.filter(p => p.id !== productId));
    setTransactions(prev => prev.filter(t => t.productId !== productId));

    toast({
        title: "Ürün Silindi",
        description: `${productToDelete.name} ve ilgili tüm işlemler silindi.`,
        variant: 'destructive'
    });
  };

  const makeSale = async (product: Product) => {
    if (product.stock === 0) {
        toast({ title: 'Stokta yok', description: 'Bu ürün stokta kalmadı.', variant: 'destructive'});
        return;
    }

    // Decrease stock
    setProducts(prev => prev.map(p => p.id === product.id ? {...p, stock: p.stock - 1} : p));

    // Add transaction
    const newTransaction: Transaction = {
        id: `trans_${Date.now()}`,
        type: 'Satış',
        productId: product.id,
        productName: product.name,
        dateTime: new Date(),
        quantity: 1,
        amount: product.sellingPrice,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    toast({
        title: "Satış Başarılı",
        description: `${product.name} ürününden 1 adet satıldı.`,
    });
  };

   const makeReturn = async (product: Product) => {
    // Increase stock
    setProducts(prev => prev.map(p => p.id === product.id ? {...p, stock: p.stock + 1} : p));

    // Add return transaction
    const newTransaction: Transaction = {
      id: `trans_${Date.now()}`,
      type: 'İade',
      productId: product.id,
      productName: product.name,
      dateTime: new Date(),
      quantity: 1,
      amount: -product.sellingPrice,
    };
    setTransactions(prev => [newTransaction, ...prev]);

    toast({
      title: "İade Başarılı",
      description: `${product.name} ürününden 1 adet iade alındı.`,
      variant: 'destructive',
    });
  };

  const login = async (email: string, password: string) => {
    if (email === 'SZN@szn.com' && password === '331742') {
        const userData = { email };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        router.push('/dashboard');
    } else {
        toast({ title: 'Giriş Başarısız', description: 'E-posta veya şifre yanlış.', variant: 'destructive' });
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  const value: AppContextType = {
    user,
    isUserLoading,
    products,
    transactions,
    loading,
    summaryData,
    totalStock,
    groupedTransactions,
    topSellingProducts,
    topReturningProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    makeSale,
    makeReturn,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
