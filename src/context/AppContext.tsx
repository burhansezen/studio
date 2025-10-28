'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import { products as initialProducts, transactions as initialTransactions } from '@/lib/data';
import { DollarSign, ShoppingBag, ArrowLeftRight } from 'lucide-react';

type AppContextType = {
  products: Product[];
  transactions: Transaction[];
  summaryData: SummaryCardData[];
  totalStock: number;
  addProduct: (productData: Omit<Product, 'id' | 'lastPurchaseDate'>) => void;
  updateProduct: (productData: Product) => void;
  deleteProduct: (productId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);
  
  const summaryData = useMemo(() => {
    const totalRevenue = transactions.filter(t => t.type === 'Satış').reduce((sum, t) => sum + t.amount, 0);
    const totalReturns = transactions.filter(t => t.type === 'İade').reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalRevenue + totalReturns;

    return [
      { title: 'Net Gelir', value: `₺${netIncome.toLocaleString('tr-TR')}`, change: '+20.1% geçen aydan', icon: DollarSign },
      { title: 'Satışlar', value: `+₺${totalRevenue.toLocaleString('tr-TR')}`, change: '+180.1% geçen aydan', icon: ShoppingBag },
      { title: 'İadeler', value: `₺${totalReturns.toLocaleString('tr-TR')}`, change: '+19% geçen aydan', icon: ArrowLeftRight },
    ];
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

  const value = {
    products,
    transactions,
    summaryData,
    totalStock,
    addProduct,
    updateProduct,
    deleteProduct,
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