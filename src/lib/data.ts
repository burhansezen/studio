import type { Product, Transaction, SummaryCardData } from './types';
import { DollarSign, ShoppingBag, ArrowLeftRight } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

function findImage(id: string) {
  return PlaceHolderImages.find((img) => img.id === id)?.imageUrl || 'https://placehold.co/400x400';
}

export const products: Product[] = [
  { id: '1', name: '18" Alaşım Jant Takımı', stock: 12, purchasePrice: 12000, sellingPrice: 15000, compatibility: 'VW Golf, Audi A3', imageUrl: findImage('product-wheel'), lastPurchaseDate: '2024-05-10' },
  { id: '2', name: 'LED Far Kiti', stock: 35, purchasePrice: 2000, sellingPrice: 2500, compatibility: 'BMW 3 Serisi, Mercedes C Serisi', imageUrl: findImage('product-headlight'), lastPurchaseDate: '2024-05-20' },
  { id: '3', name: 'Karbon Fiber Spoiler', stock: 8, purchasePrice: 6000, sellingPrice: 7500, compatibility: 'Universal', imageUrl: findImage('product-spoiler'), lastPurchaseDate: '2024-04-15' },
  { id: '4', name: 'Performans Egzoz Sistemi', stock: 5, purchasePrice: 21000, sellingPrice: 25000, compatibility: 'Ford Mustang, Chevrolet Camaro', imageUrl: findImage('product-exhaust'), lastPurchaseDate: '2024-05-01' },
  { id: '5', name: 'Yarış Koltuğu', stock: 16, purchasePrice: 7500, sellingPrice: 9000, compatibility: 'Universal', imageUrl: findImage('product-seat'), lastPurchaseDate: '2024-05-22' },
  { id: '6', name: 'Android Multimedya Ekranı', stock: 22, purchasePrice: 4800, sellingPrice: 6000, compatibility: 'Toyota Corolla, Honda Civic', imageUrl: findImage('product-multimedia'), lastPurchaseDate: '2024-05-18' },
];

export const transactions: Transaction[] = [
  { id: 't1', type: 'Satış', productName: 'LED Far Kiti', date: '2024-05-28', quantity: 2, amount: 5000 },
  { id: 't2', type: 'Alış', productName: '18" Alaşım Jant Takımı', date: '2024-05-27', quantity: 4, amount: -48000 },
  { id: 't3', type: 'Satış', productName: 'Android Multimedya Ekranı', date: '2024-05-26', quantity: 1, amount: 6000 },
  { id: 't4', type: 'İade', productName: 'LED Far Kiti', date: '2024-05-25', quantity: 1, amount: -2500 },
  { id: 't5', type: 'Satış', productName: 'Yarış Koltuğu', date: '2024-05-24', quantity: 2, amount: 18000 },
  { id: 't6', type: 'Alış', productName: 'Performans Egzoz Sistemi', date: '2024-05-23', quantity: 2, amount: -42000 },
  { id: 't7', type: 'Satış', productName: 'Karbon Fiber Spoiler', date: '2024-05-22', quantity: 1, amount: 7500 },
];

const totalRevenue = transactions.filter(t => t.type === 'Satış').reduce((sum, t) => sum + t.amount, 0);
const totalReturns = transactions.filter(t => t.type === 'İade').reduce((sum, t) => sum + t.amount, 0);
const netIncome = totalRevenue + totalReturns;

export const summaryData: SummaryCardData[] = [
  { title: 'Net Gelir', value: `₺${netIncome.toLocaleString('tr-TR')}`, change: '+20.1% geçen aydan', icon: DollarSign },
  { title: 'Satışlar', value: `+₺${totalRevenue.toLocaleString('tr-TR')}`, change: '+180.1% geçen aydan', icon: ShoppingBag },
  { title: 'İadeler', value: `₺${totalReturns.toLocaleString('tr-TR')}`, change: '+19% geçen aydan', icon: ArrowLeftRight },
];
