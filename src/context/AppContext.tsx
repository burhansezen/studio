'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import {
  DollarSign,
  ShoppingBag,
  ArrowLeftRight,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ProductFormValues } from '@/app/(main)/inventory/add-product-form';
import { useAuth, useFirestore } from '@/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

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
  const { user } = useAuth();
  const firestore = useFirestore();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState({ products: true, transactions: true });

  useEffect(() => {
    if (!firestore || !user) {
      setProducts([]);
      setTransactions([]);
      return;
    }

    setLoading({ products: true, transactions: true });

    const productsQuery = query(
      collection(firestore, 'products'),
      orderBy('createdAt', 'desc')
    );
    const productsUnsub = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productList = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Product)
        );
        setProducts(productList);
        setLoading((prev) => ({ ...prev, products: false }));
      },
      (error) => {
        console.error('Error fetching products:', error);
        toast({ title: 'Hata', description: 'Ürünler yüklenemedi.', variant: 'destructive' });
        setLoading((prev) => ({ ...prev, products: false }));
      }
    );

    const transactionsQuery = query(
      collection(firestore, 'transactions'),
      orderBy('dateTime', 'desc')
    );
    const transactionsUnsub = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionList = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
        );
        setTransactions(transactionList.map(t => ({...t, dateTime: (t.dateTime as any).toDate() })));
        setLoading((prev) => ({ ...prev, transactions: false }));
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        toast({ title: 'Hata', description: 'İşlemler yüklenemedi.', variant: 'destructive' });
        setLoading((prev) => ({ ...prev, transactions: false }));
      }
    );

    return () => {
      productsUnsub();
      transactionsUnsub();
    };
  }, [firestore, user, toast]);

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
    return transactions.reduce((acc, transaction) => {
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

  const addProduct = useCallback(async (productData: ProductFormValues) => {
    if (!firestore) return;
    try {
      const newProductData = {
        ...productData,
        imageUrl: productData.image ? 'WILL_BE_UPLOADED' : 'https://placehold.co/400x300', // Placeholder
        createdAt: serverTimestamp(),
      };
      delete (newProductData as any).image;
      await addDoc(collection(firestore, 'products'), newProductData);

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
  }, [firestore, toast]);

  const updateProduct = useCallback(async (
    productId: string,
    productData: ProductFormValues
  ) => {
    if (!firestore) return;
    try {
      const productRef = doc(firestore, 'products', productId);
      const updateData = { ...productData };
      delete (updateData as any).image; // Remove image from data to be sent to firestore

      await updateDoc(productRef, updateData);

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
  }, [firestore, toast]);

  const deleteProduct = useCallback(async (productId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'products', productId));
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
  }, [firestore, toast]);

  const makeSale = useCallback(async (product: Product) => {
    if (!firestore) return;
    if (product.stock === 0) {
      toast({
        title: 'Stokta yok',
        description: 'Bu ürün stokta kalmadı.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const batch = writeBatch(firestore);

      const productRef = doc(firestore, 'products', product.id);
      batch.update(productRef, { stock: product.stock - 1 });

      const newTransaction = {
        type: 'Satış',
        productId: product.id,
        productName: product.name,
        dateTime: serverTimestamp(),
        quantity: 1,
        amount: product.sellingPrice,
      };
      const transactionRef = doc(collection(firestore, 'transactions'));
      batch.set(transactionRef, newTransaction);
      
      await batch.commit();

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
  }, [firestore, toast]);

  const makeReturn = useCallback(async (product: Product) => {
    if (!firestore) return;
    try {
       const batch = writeBatch(firestore);

      const productRef = doc(firestore, 'products', product.id);
      batch.update(productRef, { stock: product.stock + 1 });

      const newTransaction = {
        type: 'İade',
        productId: product.id,
        productName: product.name,
        dateTime: serverTimestamp(),
        quantity: 1,
        amount: -product.sellingPrice,
      };

      const transactionRef = doc(collection(firestore, 'transactions'));
      batch.set(transactionRef, newTransaction);
      
      await batch.commit();

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
  }, [firestore, toast]);
  
  const loadBackup = useCallback(async (data: BackupData) => {
      if (!firestore) return;
      setLoading({ products: true, transactions: true });
      try {
        const batch = writeBatch(firestore);

        // Delete existing data
        const existingProductsSnapshot = await collection(firestore, 'products').get();
        existingProductsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        const existingTransactionsSnapshot = await collection(firestore, 'transactions').get();
        existingTransactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

        // Add new data
        data.products.forEach(product => {
            const productRef = doc(collection(firestore, 'products'));
            batch.set(productRef, {
                ...product,
                lastPurchaseDate: new Date(product.lastPurchaseDate),
                createdAt: new Date(product.createdAt),
            });
        });
        
        data.transactions.forEach(transaction => {
            const transactionRef = doc(collection(firestore, 'transactions'));
            batch.set(transactionRef, {
                ...transaction,
                dateTime: new Date(transaction.dateTime),
            });
        });
        
        await batch.commit();
        
        toast({
            title: 'Yedek Yüklendi',
            description: 'Verileriniz başarıyla yüklendi.',
        });
    } catch (error) {
        console.error("Yedek yükleme hatası:", error);
        toast({
            title: "Hata",
            description: "Yedek dosyası yüklenirken bir hata oluştu.",
            variant: "destructive",
        });
    } finally {
        setLoading({ products: false, transactions: false });
    }
  }, [firestore, toast]);


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
