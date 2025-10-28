'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GroupedTransactions = {
  [date: string]: Transaction[];
};


type AppContextType = {
  products: Product[];
  transactions: Transaction[];
  summaryData: SummaryCardData[];
  totalStock: number;
  groupedTransactions: GroupedTransactions;
  addProduct: (productData: Omit<Product, 'id' | 'lastPurchaseDate'>) => void;
  updateProduct: (productData: Product) => void;
  deleteProduct: (productId: string) => void;
  makeSale: (product: Product) => void;
  makeReturn: (product: Product) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

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
        const product = products.find(p => p.name === t.productName);
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
      const date = transaction.dateTime.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      acc[date].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      return acc;
    }, {} as GroupedTransactions);
  }, [transactions]);


  const addProduct = (productData: Omit<Product, 'id' | 'lastPurchaseDate'>) => {
    setProducts(prev => {
        const newProduct: Product = {
            ...productData,
            id: (prev.length > 0 ? Math.max(...prev.map(p => parseInt(p.id))) + 1 : 1).toString(),
            lastPurchaseDate: new Date().toISOString().split('T')[0],
        };
        return [newProduct, ...prev];
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    const productName = products.find(p => p.id === productId)?.name;
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (productName) {
        setTransactions(prev => prev.filter(t => t.productName !== productName));
    }
  };

  const makeSale = (product: Product) => {
    // Decrease stock
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    // Add transaction
    const newTransaction: Transaction = {
      id: `t${transactions.length + 1}`,
      type: 'Satış',
      productName: product.name,
      dateTime: new Date().toISOString(),
      quantity: 1,
      amount: product.sellingPrice,
    };
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    
    toast({
      title: "Satış Başarılı",
      description: `${product.name} ürününden 1 adet satıldı.`,
    });
  };

   const makeReturn = (product: Product) => {
    // Increase stock
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === product.id ? { ...p, stock: p.stock + 1 } : p
      )
    );

    // Add return transaction
    const newTransaction: Transaction = {
      id: `t${transactions.length + 1}`,
      type: 'İade',
      productName: product.name,
      dateTime: new Date().toISOString(),
      quantity: 1,
      amount: -product.sellingPrice, // Negative amount for return
    };
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    
    toast({
      title: "İade Başarılı",
      description: `${product.name} ürününden 1 adet iade alındı.`,
      variant: 'destructive',
    });
  };


  const value = {
    products,
    transactions,
    summaryData,
    totalStock,
    groupedTransactions,
    addProduct,
    updateProduct,
    deleteProduct,
    makeSale,
    makeReturn,
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
