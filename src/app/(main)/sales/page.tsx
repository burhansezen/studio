import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { products } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function SalesPage() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
          <CardHeader className="p-0">
            <div className="relative aspect-video">
              <Image
                src={product.imageUrl}
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
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </div>
               <Badge variant={product.stock < 10 ? 'destructive' : 'outline'}>
                 {product.stock} adet stokta
               </Badge>
            </div>
            <Button className="w-full" disabled={product.stock === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Satış Yap
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
