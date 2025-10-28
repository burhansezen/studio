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
  lastPurchaseDate: string;
}

export interface Transaction {
  id: string;
  type: 'Alış' | 'Satış' | 'İade';
  productId: string;
  productName: string;
  dateTime: Timestamp;
  quantity: number;
  amount: number;
}

export interface SummaryCardData {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}
