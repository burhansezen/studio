import type { Product, Transaction, SummaryCardData } from './types';
import { DollarSign, ShoppingBag, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

function findImage(id: string) {
  return PlaceHolderImages.find((img) => img.id === id)?.imageUrl || 'https://placehold.co/400x400';
}

export const products: Product[] = [
    {
      "id": "prod_1761646917123",
      "name": "Spor Deri Koltuk",
      "stock": 12,
      "purchasePrice": 7000,
      "sellingPrice": 9500,
      "compatibility": "Tüm Modeller",
      "imageUrl": findImage('product-seat'),
      "lastPurchaseDate": new Date("2023-10-15T10:00:00Z")
    },
    {
      "id": "prod_1761635692123",
      "name": "19' Performans Jantı",
      "stock": 8,
      "purchasePrice": 25000,
      "sellingPrice": 32000,
      "compatibility": "BMW, Audi",
      "imageUrl": findImage('product-wheel'),
      "lastPurchaseDate": new Date("2023-11-20T14:30:00Z")
    },
    {
      "id": "prod_1761669973123",
      "name": "LED Matrix Farlar",
      "stock": 22,
      "purchasePrice": 12000,
      "sellingPrice": 16500,
      "compatibility": "VW, Skoda, Seat",
      "imageUrl": findImage('product-headlight'),
      "lastPurchaseDate": new Date("2023-12-01T09:00:00Z")
    },
    {
      "id": "prod_1761634998123",
      "name": "Karbon Fiber Spoiler",
      "stock": 5,
      "purchasePrice": 8000,
      "sellingPrice": 11000,
      "compatibility": "Sedan Araçlar",
      "imageUrl": findImage('product-spoiler'),
      "lastPurchaseDate": new Date("2024-01-05T11:45:00Z")
    },
    {
      "id": "prod_1761684555123",
      "name": "Akrapovic Egzoz Sistemi",
      "stock": 3,
      "purchasePrice": 45000,
      "sellingPrice": 60000,
      "compatibility": "Performans Araçları",
      "imageUrl": findImage('product-exhaust'),
      "lastPurchaseDate": new Date("2024-02-10T16:00:00Z")
    },
    {
      "id": "prod_1761684556123",
      "name": "Multimedya Ekranı",
      "stock": 35,
      "purchasePrice": 4000,
      "sellingPrice": 6500,
      "compatibility": "Tüm Modeller",
      "imageUrl": findImage('product-multimedia'),
      "lastPurchaseDate": new Date("2024-01-25T13:20:00Z")
    },
    {
      "id": "prod_1761684557123",
      "name": "Body Kit",
      "stock": 7,
      "purchasePrice": 18000,
      "sellingPrice": 25000,
      "compatibility": "Honda Civic",
      "imageUrl": findImage('product-bodykit'),
      "lastPurchaseDate": new Date("2024-02-18T09:30:00Z")
    }
];

export const transactions: Transaction[] = [
    {
        "id": "trans_1",
        "type": "Satış",
        "productId": "prod_1761635692123",
        "productName": "19' Performans Jantı",
        "dateTime": new Date("2024-03-01T14:05:00Z"),
        "quantity": 1,
        "amount": 32000
    },
    {
        "id": "trans_2",
        "type": "Satış",
        "productId": "prod_1761669973123",
        "productName": "LED Matrix Farlar",
        "dateTime": new Date("2024-03-01T15:20:00Z"),
        "quantity": 2,
        "amount": 33000
    },
    {
        "id": "trans_3",
        "type": "Alış",
        "productId": "prod_1761646917123",
        "productName": "Spor Deri Koltuk",
        "dateTime": new Date("2024-03-02T10:00:00Z"),
        "quantity": 10,
        "amount": 70000
    },
    {
        "id": "trans_4",
        "type": "İade",
        "productId": "prod_1761635692123",
        "productName": "19' Performans Jantı",
        "dateTime": new Date("2024-03-03T11:30:00Z"),
        "quantity": 1,
        "amount": -32000
    },
    {
        "id": "trans_5",
        "type": "Satış",
        "productId": "prod_1761684556123",
        "productName": "Multimedya Ekranı",
        "dateTime": new Date("2024-03-04T16:45:00Z"),
        "quantity": 1,
        "amount": 6500
    }
];

const totalRevenue = transactions.filter(t => t.type === 'Satış').reduce((sum, t) => sum + t.amount, 0);
const totalReturns = transactions.filter(t => t.type === 'İade').reduce((sum, t) => sum + t.amount, 0);
const netIncome = totalRevenue + totalReturns;

export const summaryData: SummaryCardData[] = [
  { title: 'Net Gelir', value: `₺${netIncome.toLocaleString('tr-TR')}`, change: '+20.1% geçen aydan', icon: DollarSign },
  { title: 'Toplam Kâr', value: `₺0`, change: '', icon: TrendingUp },
  { title: 'Satışlar', value: `+₺${totalRevenue.toLocaleString('tr-TR')}`, change: '+180.1% geçen aydan', icon: ShoppingBag },
  { title: 'İadeler', value: `₺${totalReturns.toLocaleString('tr-TR')}`, change: '+19% geçen aydan', icon: ArrowLeftRight },
];
