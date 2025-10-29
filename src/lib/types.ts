import type { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  compatibility: string;
  imageUrl: string;
  lastPurchaseDate: Date;
}

export interface Transaction {
  id: string;
  type: 'Alış' | 'Satış' | 'İade';
  productId: string;
  productName: string;
  dateTime: Date;
  quantity: number;
  amount: number;
}

export interface SummaryCardData {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}
