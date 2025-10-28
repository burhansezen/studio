import Image from 'next/image';
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
import { products } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function InventoryPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Envanter Yönetimi</CardTitle>
          <CardDescription>
            Stoktaki ürünleri görüntüleyin ve yeni alımları kaydedin.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ürün Ekle
        </Button>
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
                  <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                    {product.stock} adet
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
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
