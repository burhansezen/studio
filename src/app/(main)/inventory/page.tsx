'use client';

import Image from 'next/image';
import { useState } from 'react';
import Papa from 'papaparse';
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
import { PlusCircle, Download, Edit, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ProductForm, type ProductFormValues } from './add-product-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppContext } from '@/context/AppContext';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, totalStock } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleFormSubmit = (data: ProductFormValues) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const { image, ...rest } = data;
      
      if (editingProduct) {
        updateProduct({ ...editingProduct, ...rest, imageUrl: image?.[0] ? imageUrl : editingProduct.imageUrl });
      } else {
        addProduct({ ...rest, imageUrl });
      }
    };

    if (data.image && data.image.length > 0) {
      reader.readAsDataURL(data.image[0]);
    } else {
       if (editingProduct) {
        const { image, ...rest } = data;
        updateProduct({ ...editingProduct, ...rest });
      }
    }
    
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
  };
  
  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  const handleExport = () => {
    const csvData = products.map(({ name, stock, sellingPrice, compatibility, lastPurchaseDate }) => ({
      "Ürün Adı": name,
      "Stok Adedi": stock,
      "Satış Fiyatı (TRY)": sellingPrice,
      "Uyumluluk": compatibility,
      "Son Alım Tarihi": lastPurchaseDate,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'stok_durumu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="flex flex-col gap-6">
       <Card className="w-fit">
          <CardHeader className="pb-2">
            <CardDescription>Toplam Stok</CardDescription>
            <CardTitle className="text-4xl font-bold font-headline">{totalStock} adet</CardTitle>
          </CardHeader>
        </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Envanter Yönetimi</CardTitle>
            <CardDescription>
              Stoktaki ürünleri görüntüleyin, yönetin ve dışa aktarın.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Excel'e Aktar
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              if (!open) setEditingProduct(null);
              setDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ürün Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Ürün bilgilerini güncelleyin.' : 'Yeni ürün bilgilerini girin ve envantere ekleyin.'}
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  onSubmit={handleFormSubmit}
                  product={editingProduct}
                />
              </DialogContent>
            </Dialog>
          </div>
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
                <TableHead>Satış Fiyatı</TableHead>
                <TableHead>Uyumluluk</TableHead>
                <TableHead>Son Alım Tarihi</TableHead>
                <TableHead>
                  <span className="sr-only">Eylemler</span>
                </TableHead>
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
                    {product.sellingPrice.toLocaleString('tr-TR', {
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
                  <TableCell>
                  <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Düzenle</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlem geri alınamaz. Bu, ürünü envanterinizden kalıcı olarak silecektir.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}