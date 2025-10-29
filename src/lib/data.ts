// This file is for holding initial or mock data.
import type { Product, Transaction } from './types';

export const products: Product[] = [
  {
    "id": "1",
    "name": "18' Alaşım Jant Takımı",
    "stock": 12,
    "purchasePrice": 11000,
    "sellingPrice": 14500,
    "compatibility": "VW Golf, Seat Leon, Audi A3",
    "imageUrl": "https://images.unsplash.com/photo-1606151760524-5b9563f952d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxhbGxveSUyMHdoZWVsfGVufDB8fHx8MTc2MTYzNTY5Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    "lastPurchaseDate": "2024-05-10T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "id": "2",
    "name": "LED Far Ampul Seti (H7)",
    "stock": 45,
    "purchasePrice": 600,
    "sellingPrice": 950,
    "compatibility": "Universal (H7 Soket)",
    "imageUrl": "https://images.unsplash.com/photo-1500883859571-70b85e129372?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxjYXIlMjBoZWFkbGlnaHR8ZW58MHx8fHwxNzYxNjY5OTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "lastPurchaseDate": "2024-06-01T00:00:00.000Z",
    "createdAt": "2024-02-20T00:00:00.000Z"
  },
  {
    "id": "3",
    "name": "Karbon Fiber Spoiler",
    "stock": 8,
    "purchasePrice": 2500,
    "sellingPrice": 3800,
    "compatibility": "Sedan Araçlar",
    "imageUrl": "https://images.unsplash.com/photo-1682367054258-3db6e59a215b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxjYXIlMjBzcG9pbGVyfGVufDB8fHx8MTc2MTYzNDk5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    "lastPurchaseDate": "2024-04-22T00:00:00.000Z",
    "createdAt": "2024-03-10T00:00:00.000Z"
  },
  {
    "id": "4",
    "name": "Performans Egzoz Ucu",
    "stock": 25,
    "purchasePrice": 800,
    "sellingPrice": 1350,
    "compatibility": "Universal",
    "imageUrl": "https://images.unsplash.com/photo-1572435759312-848041b1d659?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjYXIlMjBleGhhdXN0fGVufDB8fHx8MTc2MTY4NDU1NXww&ixlib=rb-4.1.0&q=80&w=1080",
    "lastPurchaseDate": "2024-05-30T00:00:00.000Z",
    "createdAt": "2024-01-25T00:00:00.000Z"
  }
];

export const transactions: Transaction[] = [
    {
        "id": "t1",
        "type": "Satış",
        "productId": "2",
        "productName": "LED Far Ampul Seti (H7)",
        "dateTime": "2024-07-20T14:30:00.000Z",
        "quantity": 2,
        "amount": 1900
      },
      {
        "id": "t2",
        "type": "Satış",
        "productId": "1",
        "productName": "18' Alaşım Jant Takımı",
        "dateTime": "2024-07-20T16:00:00.000Z",
        "quantity": 1,
        "amount": 14500
      },
      {
        "id": "t3",
        "type": "İade",
        "productId": "2",
        "productName": "LED Far Ampul Seti (H7)",
        "dateTime": "2024-07-21T11:00:00.000Z",
        "quantity": 1,
        "amount": -950
      }
];
