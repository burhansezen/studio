'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';

export default function SalesPage() {
  const { products, makeSale, loading = { products: true, transactions: true } } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) {
      return products;
    }
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Ürün ara..."
            className="w-full max-w-sm pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      
      {loading.products ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={product.imageUrl || 'https://placehold.co/400x300'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint="car part"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-lg mb-2">{product.name}</CardTitle>
                <CardDescription>{product.compatibility}</CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
                 <div className="flex justify-between w-full items-center">
                   <div className="font-bold text-xl text-primary font-headline">
                      {product.sellingPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </div>
                   <Badge variant={product.stockQuantity < 10 ? 'destructive' : 'outline'}>
                     {product.stockQuantity} adet stokta
                   </Badge>
                </div>
                <Button className="w-full" disabled={product.stockQuantity === 0} onClick={() => makeSale(product.id)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Satış Yap
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="col-span-full flex flex-col items-center justify-center p-12">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <CardTitle className="font-headline mb-2">Ürün Bulunamadı</CardTitle>
            <CardDescription>{searchTerm ? 'Aradığınız kriterlere uygun ürün bulunamadı.' : 'Henüz envanterde ürün yok.'}</CardDescription>
        </Card>
      )}
    </div>
  );
}
