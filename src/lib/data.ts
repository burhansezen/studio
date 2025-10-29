import type { Product, Transaction, SummaryCardData } from './types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

function findImage(id: string) {
  return PlaceHolderImages.find((img) => img.id === id)?.imageUrl || 'https://placehold.co/400x400';
}

export const products: Product[] = [];

export const transactions: Transaction[] = [];

const totalRevenue = transactions.filter(t => t.type === 'Satış').reduce((sum, t) => sum + t.amount, 0);
const totalReturns = transactions.filter(t => t.type === 'İade').reduce((sum, t) => sum + t.amount, 0);
const netIncome = totalRevenue + totalReturns;

export const summaryData: SummaryCardData[] = [
  { title: 'Net Gelir', value: `₺${netIncome.toLocaleString('tr-TR')}`, change: '+20.1% geçen aydan', icon: DollarSign },
  { title: 'Toplam Kâr', value: `₺0`, change: '', icon: TrendingUp },
  { title: 'Satışlar', value: `+₺${totalRevenue.toLocaleString('tr-TR')}`, change: '+180.1% geçen aydan', icon: ShoppingBag },
  { title: 'İadeler', value: `₺${totalReturns.toLocaleString('tr-TR')}`, change: '+19% geçen aydan', icon: ArrowLeftRight },
];
