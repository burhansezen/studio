'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import {
  useFirestore,
  useUser,
  useAuth,
  useMemoFirebase,
} from '@/firebase/provider';
import {
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';

import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ProductFormValues } from '@/app/(main)/inventory/add-product-form';

type GroupedTransactions = {
  [date: string]: WithId<Transaction>[];
};
type ProductCount = { productName: string; count: number };
type BackupData = { products: Product[]; transactions: Transaction[] };

type AppContextType = {
  products: WithId<Product>[] | null;
  transactions: WithId<Transaction>[] | null;
  loading: {
    products: boolean;
    transactions: boolean;
  };
  user: User | null;
  isUserLoading: boolean;
  summaryData: SummaryCardData[];
  totalStock: number;
  groupedTransactions: GroupedTransactions;
  topSellingProducts: ProductCount[];
  topReturningProducts: ProductCount[];
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addProduct: (productData: ProductFormValues) => Promise<void>;
  updateProduct: (
    productId: string,
    productData: ProductFormValues
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  makeSale: (product: WithId<Product>) => Promise<void>;
  makeReturn: (product: WithId<Product>) => Promise<void>;
  loadBackup: (data: BackupData) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const productsRef = useMemoFirebase(
    () =>
      firestore && user && !isUserLoading
        ? collection(firestore, 'products')
        : null,
    [firestore, user, isUserLoading]
  );
  const transactionsRef = useMemoFirebase(
    () =>
      firestore && user && !isUserLoading
        ? collection(firestore, 'transactions')
        : null,
    [firestore, user, isUserLoading]
  );

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useCollection<Product>(productsRef);
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useCollection<Transaction>(transactionsRef);

  const loading = {
    products: productsLoading,
    transactions: transactionsLoading,
  };

  const toDate = (date: any): Date => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return new Date(date);
  };

  const totalStock = useMemo(() => {
    if (!products) return 0;
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);

  const summaryData = useMemo(() => {
    if (!transactions || !products) {
       return [
        { title: 'Net Gelir', value: '₺0', change: '', icon: DollarSign },
        { title: 'Net Kâr', value: '₺0', change: '', icon: TrendingUp },
        { title: 'Toplam Satış', value: '+₺0', change: '', icon: ShoppingBag },
        { title: 'Toplam İade', value: '₺0', change: '', icon: ArrowLeftRight },
      ];
    }

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
    if (!transactions) return {};
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
    if (!transactions) return [];
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
    if (!transactions) return [];
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
  
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: 'Giriş Başarılı', description: 'Panele hoş geldiniz.' });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Giriş Başarısız',
        description: 'E-posta veya şifre hatalı.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Çıkış Yapıldı', description: 'Güvenle çıkış yaptınız.' });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Hata',
        description: 'Çıkış yaparken bir sorun oluştu.',
        variant: 'destructive',
      });
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `products/${new Date().getTime()}_${file.name}`);
    const base64 = await getBase64(file);
    await uploadString(storageRef, base64, 'data_url');
    return getDownloadURL(storageRef);
  };

  const addProduct = async (productData: ProductFormValues) => {
    if (!firestore || !productsRef) return;
    try {
      let imageUrl = 'https://placehold.co/400x300';
      if (productData.image && productData.image.length > 0) {
        imageUrl = await uploadImage(productData.image[0]);
      }

      await addDoc(productsRef, {
        ...productData,
        image: undefined, // remove from data to be written
        imageUrl,
        createdAt: productData.lastPurchaseDate, // Corrected date handling
        lastPurchaseDate: productData.lastPurchaseDate,
      });

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
    if (!firestore) return;
    try {
      const productRef = doc(firestore, 'products', productId);
      let imageUrl: string | undefined = undefined;
      if (productData.image && productData.image.length > 0) {
        imageUrl = await uploadImage(productData.image[0]);
      }

      const updatedData: Partial<Product> & {image?: any} = {
        ...productData,
        image: undefined, // remove from data to be written
        lastPurchaseDate: productData.lastPurchaseDate,
      };

      if (imageUrl) {
        updatedData.imageUrl = imageUrl;
      }
      
      await updateDoc(productRef, updatedData);

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
    if (!firestore) return;
    try {
      const productRef = doc(firestore, 'products', productId);
      await deleteDoc(productRef);
      // Note: Related transactions are not deleted automatically to preserve history.
      // This could be a feature to add later if needed.
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

  const makeSale = async (product: WithId<Product>) => {
    if (!firestore || !transactionsRef) return;
    if (product.stock === 0) {
      toast({
        title: 'Stokta yok',
        description: 'Bu ürün stokta kalmadı.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const productRef = doc(firestore, 'products', product.id);
      
      const batch = writeBatch(firestore);
      batch.update(productRef, { stock: product.stock - 1 });
      
      const newTransaction: Transaction = {
        type: 'Satış',
        productId: product.id,
        productName: product.name,
        dateTime: new Date(),
        quantity: 1,
        amount: product.sellingPrice,
      };
      
      const transRef = doc(transactionsRef);
      batch.set(transRef, newTransaction);
      
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
  };

  const makeReturn = async (product: WithId<Product>) => {
    if (!firestore || !transactionsRef) return;
    try {
      const productRef = doc(firestore, 'products', product.id);

      const batch = writeBatch(firestore);
      batch.update(productRef, { stock: product.stock + 1 });

      const newTransaction: Transaction = {
        type: 'İade',
        productId: product.id,
        productName: product.name,
        dateTime: new Date(),
        quantity: 1,
        amount: -product.sellingPrice,
      };
      const transRef = doc(transactionsRef);
      batch.set(transRef, newTransaction);
      
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
  };

  const loadBackup = async (data: BackupData) => {
    if (!firestore) {
        toast({
            title: "Hata",
            description: "Veritabanı bağlantısı kurulamadı.",
            variant: "destructive",
        });
        return;
    }
    
    try {
        const batch = writeBatch(firestore);

        if(data.products && productsRef){
            data.products.forEach(product => {
                const docRef = doc(productsRef);
                // Ensure dates are converted to Timestamps
                const productData = {
                  ...product,
                  createdAt: new Date(product.createdAt),
                  lastPurchaseDate: new Date(product.lastPurchaseDate),
                };
                batch.set(docRef, productData);
            });
        }

        if(data.transactions && transactionsRef){
            data.transactions.forEach(transaction => {
                const docRef = doc(transactionsRef);
                const transactionData = {
                  ...transaction,
                  dateTime: new Date(transaction.dateTime),
                }
                batch.set(docRef, transactionData);
            });
        }
        
        await batch.commit();

        toast({
            title: "Yedek Yüklendi",
            description: "Verileriniz veritabanına başarıyla yüklendi.",
        });

    } catch (error) {
        console.error("Yedek yükleme hatası:", error);
        toast({
          title: "Hata",
          description: "Yedek dosyası veritabanına yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
    }
  };

  const value: AppContextType = {
    products,
    transactions,
    loading,
    user,
    isUserLoading,
    summaryData,
    totalStock,
    groupedTransactions,
    topSellingProducts,
    topReturningProducts,
    login,
    logout,
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
