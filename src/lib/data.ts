import type { Product, Transaction, SummaryCardData } from './types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

function findImage(id: string) {
  return PlaceHolderImages.find((img) => img.id === id)?.imageUrl || 'https://placehold.co/400x400';
}

export const products: Product[] = [];

export const transactions: Transaction[] = [];
