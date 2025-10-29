'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { Product, Transaction, SummaryCardData } from '@/lib/types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductFormValues } from '@/app/(main)/inventory/add-product-form';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore, useAuth, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

type GroupedTransactions = {
  [date: string]: Transaction[];
};

type ProductCount = {
  productName: string;
  count: number;
};

type AppContextType = {
  user: any | null;
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const transactionsRef = useMemoFirebase(() => firestore ? collection(firestore, 'transactions') : null, [firestore]);

  const { data: productsData, isLoading: productsLoading } = useCollection<Product>(productsRef);
  const { data: transactionsData, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsRef);

  const toDate = (timestamp: string | Date | Timestamp) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  }

  const products = useMemo(() => productsData || [], [productsData]);
  const transactions = useMemo(() => (transactionsData || []).map(t => ({...t, dateTime: toDate(t.dateTime)})).sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime()), [transactionsData]);

  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);

  const summaryData = useMemo(() => {
    const totalRevenue = transactions.filter(t => t.type === 'Satış').reduce((sum, t) => sum + t.amount, 0);
    const totalReturns = transactions.filter(t => t.type === 'İade').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netIncome = totalRevenue - totalReturns;

    const netProfit = transactions
      .reduce((sum, t) => {
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
      { title: 'Toplam İade', value: `₺${totalReturns.toLocaleString('tr-TR')}`, change: '', icon: ArrowLeftRight },
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
    if (!firestore || !productsRef) return;
    try {
      let imageUrl = 'https://placehold.co/400x300';
      if (productData.image && productData.image.length > 0) {
        imageUrl = await getBase64(productData.image[0]);
      }
      
      const { image, ...rest } = productData;

      const newProductData = {
        ...rest,
        imageUrl,
        createdAt: serverTimestamp(),
      };
      await addDoc(productsRef, newProductData);

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
    try {
      let imageUrl: string | undefined = undefined;
      if (productData.image && productData.image.length > 0) {
        imageUrl = await getBase64(productData.image[0]);
      }
      
      const { image, ...rest } = productData;
      const productRef = doc(firestore, 'products', productId);
      const updatedData: any = {
          ...rest,
      };

      if (imageUrl) {
          updatedData.imageUrl = imageUrl;
      }

      await updateDoc(productRef, updatedData);

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
    if (!firestore) return;
    try {
        const productToDelete = products.find(p => p.id === productId);
        if (!productToDelete) return;

        const batch = writeBatch(firestore);

        const productRef = doc(firestore, 'products', productId);
        batch.delete(productRef);

        const relatedTransactions = transactions.filter(t => t.productId === productId);
        relatedTransactions.forEach(t => {
            const transRef = doc(firestore, 'transactions', t.id);
            batch.delete(transRef);
        });
        
        await batch.commit();

        toast({
            title: "Ürün Silindi",
            description: `${productToDelete.name} ve ilgili tüm işlemler silindi.`,
            variant: 'destructive'
        });
    } catch(error) {
        console.error("Error deleting product and transactions: ", error);
        toast({
            title: "Hata",
            description: "Ürün silinirken bir hata oluştu.",
            variant: "destructive"
        });
    }
  };

  const makeSale = async (product: Product) => {
    if (!firestore || !transactionsRef) return;
    if (product.stock === 0) {
        toast({ title: 'Stokta yok', description: 'Bu ürün stokta kalmadı.', variant: 'destructive'});
        return;
    }
    
    const productRef = doc(firestore, 'products', product.id);
    const newTransactionData = {
        type: 'Satış',
        productId: product.id,
        productName: product.name,
        dateTime: serverTimestamp(),
        quantity: 1,
        amount: product.sellingPrice,
    };

    try {
      const batch = writeBatch(firestore);
      batch.update(productRef, { stock: product.stock - 1 });
      batch.set(doc(transactionsRef), newTransactionData);
      await batch.commit();
      
      toast({
          title: "Satış Başarılı",
          description: `${product.name} ürününden 1 adet satıldı.`,
      });
    } catch(error){
       console.error("Error making sale: ", error);
       toast({ title: 'Satış Hatası', description: 'İşlem sırasında bir hata oluştu.', variant: 'destructive'});
    }
  };

   const makeReturn = async (product: Product) => {
    if (!firestore || !transactionsRef) return;
    const productRef = doc(firestore, 'products', product.id);
    const newTransactionData = {
      type: 'İade',
      productId: product.id,
      productName: product.name,
      dateTime: serverTimestamp(),
      quantity: 1,
      amount: -product.sellingPrice,
    };

    try {
        const batch = writeBatch(firestore);
        batch.update(productRef, { stock: product.stock + 1 });
        batch.set(doc(transactionsRef), newTransactionData);
        await batch.commit();

        toast({
          title: "İade Başarılı",
          description: `${product.name} ürününden 1 adet iade alındı.`,
          variant: 'destructive',
        });
    } catch(error) {
       console.error("Error making return: ", error);
       toast({ title: 'İade Hatası', description: 'İşlem sırasında bir hata oluştu.', variant: 'destructive'});
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth) return;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
    } catch (error) {
        console.error("Login error", error)
        toast({ title: 'Giriş Başarısız', description: 'E-posta veya şifre yanlış.', variant: 'destructive' });
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
        await firebaseSignOut(auth);
        router.push('/login');
    } catch(error) {
        console.error("Logout error", error);
        toast({ title: 'Çıkış Hatası', description: 'Oturum kapatılırken bir sorun oluştu.', variant: 'destructive' });
    }
  };

  const value: AppContextType = {
    user,
    isUserLoading,
    products,
    transactions,
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
