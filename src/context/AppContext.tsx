'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductFormValues } from '@/app/(main)/inventory/add-product-form';
import { products as initialProducts, transactions as initialTransactions } from '@/lib/data';

type GroupedTransactions = {
  [date: string]: Transaction[];
};

type ProductCount = {
  productName: string;
  count: number;
};

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
  updateProduct: (productId: string, productData: ProductFormValues) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  makeSale: (product: Product) => Promise<void>;
  makeReturn: (product: Product) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState({ products: true, transactions: true });

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      const storedTransactions = localStorage.getItem('transactions');

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions).map((t: any) => ({...t, dateTime: new Date(t.dateTime)})));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setLoading({ products: false, transactions: false });
    }
  }, []);

  useEffect(() => {
    try {
       if(!loading.products){
         localStorage.setItem('products', JSON.stringify(products));
       }
    } catch (error) {
      console.error("Failed to save products to localStorage", error);
    }
  }, [products, loading.products]);

  useEffect(() => {
    try {
        if(!loading.transactions){
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
    }
  }, [transactions, loading.transactions]);


  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);

  const summaryData = useMemo(() => {
    const totalRevenue = transactions.filter(t => t.type === 'Satış').reduce((sum, t) => sum + t.amount, 0);
    const totalReturnsAmount = transactions.filter(t => t.type === 'İade').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netIncome = totalRevenue - totalReturnsAmount;
    
    const netProfit = transactions.reduce((sum, t) => {
        const product = products.find(p => p.id === t.productId);
        if (!product) return sum;

        const profitPerItem = product.sellingPrice - product.purchasePrice;
        if (t.type === 'Satış') {
          return sum + (profitPerItem * t.quantity);
        }
        if(t.type === 'İade') {
          return sum - (profitPerItem * t.quantity);
        }
        return sum;
      }, 0);


    return [
      { title: 'Net Gelir', value: `₺${netIncome.toLocaleString('tr-TR')}`, change: '', icon: DollarSign },
      { title: 'Net Kâr', value: `₺${netProfit.toLocaleString('tr-TR')}`, change: '', icon: TrendingUp },
      { title: 'Toplam Satış', value: `+₺${totalRevenue.toLocaleString('tr-TR')}`, change: '', icon: ShoppingBag },
      { title: 'Toplam İade', value: `₺${totalReturnsAmount.toLocaleString('tr-TR')}`, change: '', icon: ArrowLeftRight },
    ];
  }, [transactions, products]);

  const groupedTransactions = useMemo(() => {
    const sortedTransactions = [...transactions].sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    return sortedTransactions.reduce((acc, transaction) => {
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
      
      const newProduct: Product = {
        id: new Date().getTime().toString(),
        name: productData.name,
        stock: productData.stock,
        purchasePrice: productData.purchasePrice,
        sellingPrice: productData.sellingPrice,
        compatibility: productData.compatibility,
        imageUrl,
        lastPurchaseDate: productData.lastPurchaseDate,
        createdAt: new Date(),
      };
  
      setProducts(prevProducts => [newProduct, ...prevProducts]);
      
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

        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                const updatedProduct = {
                    ...p,
                    ...productData,
                    lastPurchaseDate: productData.lastPurchaseDate,
                    image: undefined, // remove image from data
                };
                if (imageUrl) {
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
    setProducts(prev => prev.filter(p => p.id !== productId));
    setTransactions(prev => prev.filter(t => t.productId !== productId));
    toast({
        title: "Ürün Silindi",
        description: "Ürün ve ilgili tüm işlemler silindi.",
        variant: "destructive"
    });
  };

  const makeSale = async (product: Product) => {
    if (product.stock === 0) {
      toast({ title: 'Stokta yok', description: 'Bu ürün stokta kalmadı.', variant: 'destructive'});
      return;
    }
    
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p));
    
    const newTransaction: Transaction = {
      id: new Date().getTime().toString(),
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
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock + 1 } : p));
    
    const newTransaction: Transaction = {
      id: new Date().getTime().toString(),
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
