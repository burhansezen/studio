'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { products as initialProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { AddProductForm } from './add-product-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type NewProductData = Omit<Product, 'id' | 'lastPurchaseDate' | 'imageUrl'> & { image: File };

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProduct = (newProductData: NewProductData) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const { image, ...rest } = newProductData;
      const productToAdd: Product = {
        ...rest,
        id: (products.length + 1).toString(),
        lastPurchaseDate: new Date().toISOString().split('T')[0],
        imageUrl: imageUrl,
      };
      setProducts((prevProducts) => [productToAdd, ...prevProducts]);
    };
    reader.readAsDataURL(newProductData.image);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Envanter Yönetimi</CardTitle>
          <CardDescription>
            Stoktaki ürünleri görüntüleyin ve yeni alımları kaydedin.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ürün Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Ürün Ekle</DialogTitle>
              <DialogDescription>
                Yeni ürün bilgilerini girin ve envantere ekleyin.
              </DialogDescription>
            </DialogHeader>
            <AddProductForm onAddProduct={handleAddProduct} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Resim</span>
              </TableHead>
              <TableHead>İsim</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Uyumluluk</TableHead>
              <TableHead>Son Alım Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={product.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.imageUrl}
                    width="64"
                    data-ai-hint="car part"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                    {product.stock} adet
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">
                  {product.price.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.compatibility}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.lastPurchaseDate}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
