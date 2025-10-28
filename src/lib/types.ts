import type { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  compatibility: string;
  imageUrl: string;
  lastPurchaseDate: string;
}

export interface Transaction {
  id: string;
  type: 'Alış' | 'Satış' | 'İade';
  productName: string;
  date: string;
  quantity: number;
  amount: number;
}

export interface SummaryCardData {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}
