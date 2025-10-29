// This file is for holding initial or mock data.
// In a real application, this data would likely come from a database.
import type { Product, Transaction } from './types';

// We are now using Firebase, so we can keep these arrays empty.
// The data will be fetched from Firestore.
export const products: Product[] = [];
export const transactions: Transaction[] = [];
