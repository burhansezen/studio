import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  compatibility: string;
  imageUrl: string;
  lastPurchaseDate: string | Date; // Can be string from firestore or Date object
}

export interface Transaction {
  id: string;
  type: 'Alış' | 'Satış' | 'İade';
  productId: string;
  productName: string;
  dateTime: string | Date; // Can be string from firestore or Date object
  quantity: number;
  amount: number;
}

export interface SummaryCardData {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}
