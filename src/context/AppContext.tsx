'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useCollection, 
  useFirebase,
  useMemoFirebase,
} from '@/firebase';
import { 
  collection, 
  doc, 
  writeBatch,
  serverTimestamp, 
  query, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { ProductFormValues } from '@/app/(main)/inventory/add-product-form';

type GroupedTransactions = {
  [date: string]: Transaction[];
};

type ProductCount = {
  productName: string;
  count: number;
};


type AppContextType = {
  products: Product[] | null;
  transactions: Transaction[] | null;
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
  const { firestore } = useFirebase();

  const productsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'products'), orderBy('lastPurchaseDate', 'desc')) : null, [firestore]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const transactionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'transactions'), orderBy('dateTime', 'desc')) : null, [firestore]);
  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);
  
  const totalStock = useMemo(() => {
    if (!products) return 0;
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);
  
  const summaryData = useMemo(() => {
    if (!transactions || !products) return [
        { title: 'Net Gelir', value: '₺0', change: '', icon: DollarSign },
        { title: 'Toplam Kâr', value: '₺0', change: '', icon: TrendingUp },
        { title: 'Satışlar', value: '+₺0', change: '', icon: ShoppingBag },
        { title: 'İadeler', value: '₺0', change: '', icon: ArrowLeftRight },
    ];

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
    if (!transactions) return {};
    return transactions.reduce((acc, transaction) => {
      const date = transaction.dateTime.toDate().toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      // Sorting within group is implicitly handled by the initial query sort
      return acc;
    }, {} as GroupedTransactions);
  }, [transactions]);

  const topSellingProducts = useMemo(() => {
    if(!transactions) return [];
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
    if(!transactions) return [];
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

  const uploadImage = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const dataUrl = e.target?.result as string;
                await uploadString(storageRef, dataUrl, 'data_url');
                const downloadURL = await getDownloadURL(storageRef);
                resolve(downloadURL);
            } catch (error) {
                console.error("Image upload failed:", error);
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error("FileReader error:", error);
            reject(error);
        };
        reader.readAsDataURL(file);
    });
  };

  const addProduct = async (productData: ProductFormValues) => {
    if (!firestore) return;
    try {
      let imageUrl = '';
      if (productData.image && productData.image.length > 0) {
        imageUrl = await uploadImage(productData.image[0]);
      }
      
      const { image, ...rest } = productData;

      await addDoc(collection(firestore, 'products'), {
        ...rest,
        imageUrl,
        lastPurchaseDate: new Date().toISOString().split('T')[0],
      });

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
    if (!firestore) return;
    const productRef = doc(firestore, 'products', productId);
    try {
      let imageUrl: string | undefined = undefined;
      if (productData.image && productData.image.length > 0) {
        // Note: This could lead to orphaned images in storage if not managed
        imageUrl = await uploadImage(productData.image[0]);
      }
      
      const { image, ...rest } = productData;
      const updateData: Partial<ProductFormValues & {imageUrl?: string}> = {...rest};
      if(imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      await updateDoc(productRef, updateData);

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
    if (!firestore || !products) return;
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;

    try {
      const batch = writeBatch(firestore);

      // Delete the product document
      const productRef = doc(firestore, 'products', productId);
      batch.delete(productRef);

      // Delete product image from storage
      if (productToDelete.imageUrl) {
        try {
          const storage = getStorage();
          const imageRef = ref(storage, productToDelete.imageUrl);
          await deleteObject(imageRef);
        } catch (storageError: any) {
          // If the image doesn't exist, we can ignore the error
          if (storageError.code !== 'storage/object-not-found') {
            console.error("Error deleting product image: ", storageError);
            // Optionally, you might not want to fail the whole operation for this
          }
        }
      }

      // Find and delete all related transactions
      const transactionsToDelete = transactions?.filter(t => t.productId === productId);
      transactionsToDelete?.forEach(t => {
        const transactionRef = doc(firestore, 'transactions', t.id);
        batch.delete(transactionRef);
      });
      
      await batch.commit();

      toast({
        title: "Ürün Silindi",
        description: `${productToDelete.name} ve ilgili tüm işlemler silindi.`,
        variant: 'destructive'
      });

    } catch (error) {
      console.error("Error deleting product and its transactions: ", error);
      toast({
        title: "Hata",
        description: "Ürün silinirken bir hata oluştu.",
        variant: 'destructive',
      });
    }
  };

  const makeSale = async (product: Product) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'products', product.id);
    const transactionsRef = collection(firestore, 'transactions');
    try {
        const batch = writeBatch(firestore);

        // Decrease stock
        batch.update(productRef, { stock: product.stock - 1 });

        // Add transaction
        const newTransaction = {
            type: 'Satış',
            productId: product.id,
            productName: product.name,
            dateTime: serverTimestamp(),
            quantity: 1,
            amount: product.sellingPrice,
        };
        // Can't use batch with addDoc, so we create a new doc ref
        const newTransactionRef = doc(transactionsRef);
        batch.set(newTransactionRef, newTransaction);
        
        await batch.commit();
        
        toast({
            title: "Satış Başarılı",
            description: `${product.name} ürününden 1 adet satıldı.`,
        });
    } catch (error) {
        console.error("Error making sale: ", error);
        toast({
            title: "Hata",
            description: "Satış yapılırken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

   const makeReturn = async (product: Product) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'products', product.id);
    const transactionsRef = collection(firestore, 'transactions');
    try {
      const batch = writeBatch(firestore);
      
      // Increase stock
      batch.update(productRef, { stock: product.stock + 1 });
      
      // Add return transaction
      const newTransaction = {
        type: 'İade',
        productId: product.id,
        productName: product.name,
        dateTime: serverTimestamp(),
        quantity: 1,
        amount: -product.sellingPrice, // Negative amount for return
      };
      const newTransactionRef = doc(transactionsRef);
      batch.set(newTransactionRef, newTransaction);
      
      await batch.commit();

      toast({
        title: "İade Başarılı",
        description: `${product.name} ürününden 1 adet iade alındı.`,
        variant: 'destructive',
      });
    } catch (error) {
        console.error("Error making return: ", error);
        toast({
            title: "Hata",
            description: "İade yapılırken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };


  const value = {
    products,
    transactions: transactions || [],
    loading: {
        products: productsLoading,
        transactions: transactionsLoading
    },
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
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
