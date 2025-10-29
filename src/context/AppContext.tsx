'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import {
  products as initialProducts,
  transactions as initialTransactions,
} from '@/lib/data';
import {
  DollarSign,
  ShoppingBag,
  ArrowLeftRight,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ProductFormValues } from '@/app/(main)/inventory/add-product-form';

type GroupedTransactions = {
  [date: string]: Transaction[];
};
type ProductCount = { productName: string; count: number };
type BackupData = { products: Product[]; transactions: Transaction[] };

type AppContextType = {
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
  updateProduct: (
    productId: string,
    productData: ProductFormValues
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  makeSale: (product: Product) => Promise<void>;
  makeReturn: (product: Product) => Promise<void>;
  loadBackup: (data: BackupData) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState({ products: true, transactions: true });

  useEffect(() => {
    // Simulate loading from an API
    setTimeout(() => {
      setProducts(initialProducts);
      setTransactions(initialTransactions);
      setLoading({ products: false, transactions: false });
    }, 500);
  }, []);

  const toDate = (date: string | Date): Date => {
    return new Date(date);
  };

  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);

  const summaryData = useMemo(() => {
    const totalRevenue = transactions
      .filter((t) => t.type === 'Satış')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalReturnsAmount = transactions
      .filter((t) => t.type === 'İade')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netIncome = totalRevenue - totalReturnsAmount;

    const netProfit = transactions.reduce((sum, t) => {
      const product = products.find((p) => p.id === t.productId);
      if (!product) return sum;

      const profitPerItem = product.sellingPrice - product.purchasePrice;
      if (t.type === 'Satış') {
        return sum + profitPerItem * t.quantity;
      }
      if (t.type === 'İade') {
        return sum - profitPerItem * t.quantity;
      }
      return sum;
    }, 0);

    return [
      {
        title: 'Net Gelir',
        value: `₺${netIncome.toLocaleString('tr-TR')}`,
        change: '',
        icon: DollarSign,
      },
      {
        title: 'Net Kâr',
        value: `₺${netProfit.toLocaleString('tr-TR')}`,
        change: '',
        icon: TrendingUp,
      },
      {
        title: 'Toplam Satış',
        value: `+₺${totalRevenue.toLocaleString('tr-TR')}`,
        change: '',
        icon: ShoppingBag,
      },
      {
        title: 'Toplam İade',
        value: `₺${totalReturnsAmount.toLocaleString('tr-TR')}`,
        change: '',
        icon: ArrowLeftRight,
      },
    ];
  }, [transactions, products]);

  const groupedTransactions = useMemo(() => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => toDate(b.dateTime).getTime() - toDate(a.dateTime).getTime()
    );
    return sortedTransactions.reduce((acc, transaction) => {
      const date = toDate(transaction.dateTime).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as GroupedTransactions);
  }, [transactions]);

  const topSellingProducts = useMemo(() => {
    const sales = transactions.filter((t) => t.type === 'Satış');
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
    const returns = transactions.filter((t) => t.type === 'İade');
    const productCounts = returns.reduce((acc, ret) => {
      acc[ret.productName] = (acc[ret.productName] || 0) + ret.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productCounts)
      .map(([productName, count]) => ({ productName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [transactions]);

  const addProduct = async (productData: ProductFormValues) => {
    try {
      // In a real app, this would be an API call. Here we simulate it.
      const newProduct: Product = {
        id: new Date().getTime().toString(), // simple unique id
        ...productData,
        image: undefined, // property does not exist on Product
        imageUrl: 'https://placehold.co/400x300', // placeholder
        createdAt: new Date(),
        lastPurchaseDate: productData.lastPurchaseDate,
      };
      setProducts((prev) => [newProduct, ...prev]);

      toast({
        title: 'Ürün Eklendi',
        description: `${productData.name} başarıyla eklendi.`,
      });
    } catch (error) {
      console.error('Error adding product: ', error);
      toast({
        title: 'Hata',
        description: 'Ürün eklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const updateProduct = async (
    productId: string,
    productData: ProductFormValues
  ) => {
    try {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, ...productData, image: undefined, lastPurchaseDate: productData.lastPurchaseDate } : p
        )
      );

      toast({
        title: 'Ürün Güncellendi',
        description: `${productData.name} başarıyla güncellendi.`,
      });
    } catch (error) {
      console.error('Error updating product: ', error);
      toast({
        title: 'Hata',
        description: 'Ürün güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({
        title: 'Ürün Silindi',
        description: 'Ürün envanterden kaldırıldı.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting product: ', error);
      toast({
        title: 'Hata',
        description: 'Ürün silinirken bir sorun oluştu.',
        variant: 'destructive',
      });
    }
  };

  const makeSale = async (product: Product) => {
    if (product.stock === 0) {
      toast({
        title: 'Stokta yok',
        description: 'Bu ürün stokta kalmadı.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, stock: p.stock - 1 } : p
        )
      );

      const newTransaction: Transaction = {
        id: new Date().getTime().toString(),
        type: 'Satış',
        productId: product.id,
        productName: product.name,
        dateTime: new Date(),
        quantity: 1,
        amount: product.sellingPrice,
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      toast({
        title: 'Satış Başarılı',
        description: `${product.name} ürününden 1 adet satıldı.`,
      });
    } catch (error) {
      console.error('Error making sale: ', error);
      toast({
        title: 'Hata',
        description: 'Satış işlemi sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const makeReturn = async (product: Product) => {
    try {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, stock: p.stock + 1 } : p
        )
      );

      const newTransaction: Transaction = {
        id: new Date().getTime().toString(),
        type: 'İade',
        productId: product.id,
        productName: product.name,
        dateTime: new Date(),
        quantity: 1,
        amount: -product.sellingPrice,
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      toast({
        title: 'İade Başarılı',
        description: `${product.name} ürününden 1 adet iade alındı.`,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error making return: ', error);
      toast({
        title: 'Hata',
        description: 'İade işlemi sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const loadBackup = async (data: BackupData) => {
    setLoading({ products: true, transactions: true });
    setProducts(data.products || []);
    setTransactions(data.transactions || []);
    setLoading({ products: false, transactions: false });
    toast({
        title: 'Yedek Yüklendi',
        description: 'Verileriniz başarıyla yüklendi.',
    });
  };

  const value: AppContextType = {
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
    loadBackup,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
