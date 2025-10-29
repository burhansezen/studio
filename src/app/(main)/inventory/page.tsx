'use client';

import Image from 'next/image';
import { useState, useRef, ChangeEvent } from 'react';
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
import { PlusCircle, Download, Edit, Trash2, Undo2, Loader2, Upload, Save } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { products, transactions, addProduct, updateProduct, deleteProduct, totalStock, makeReturn, loading, loadBackup } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (data: ProductFormValues) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await addProduct(data);
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
  
  const toDate = (date: string | Date) => new Date(date);

  const handleExportCsv = () => {
    if(!products) return;
    const csvData = products.map(({ name, stock, sellingPrice, compatibility, lastPurchaseDate }) => ({
      "Ürün Adı": name,
      "Stok Adedi": stock,
      "Satış Fiyatı (TRY)": sellingPrice,
      "Uyumluluk": compatibility,
      "Son Alım Tarihi": toDate(lastPurchaseDate).toLocaleDateString('tr-TR'),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'stok_durumu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const backupData = {
      products,
      transactions,
    };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'szn-auto-yedek.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
        title: "Yedekleme Başarılı",
        description: "Tüm verileriniz 'szn-auto-yedek.json' dosyasına kaydedildi.",
    });
  };

  const handleImportJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Dosya içeriği okunamadı.');
        }
        const data = JSON.parse(text);
        if (data && data.products && data.transactions) {
          loadBackup(data);
        } else {
          throw new Error('Geçersiz yedek dosyası formatı.');
        }
      } catch (error) {
        console.error("Yedek yükleme hatası:", error);
        toast({
          title: "Hata",
          description: "Yedek dosyası yüklenirken bir hata oluştu. Lütfen dosyanın doğru formatta olduğundan emin olun.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);

    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
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
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-headline">Envanter Yönetimi</CardTitle>
            <CardDescription>
              Stoktaki ürünleri görüntüleyin, yönetin ve yedekleyin.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/json"
              onChange={handleImportJson} 
            />
             <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Yedekten Yükle (JSON)
            </Button>
            <Button variant="outline" onClick={handleExportJson}>
              <Save className="mr-2 h-4 w-4" />
              Yedekle (JSON)
            </Button>
            <Button variant="outline" onClick={handleExportCsv} disabled={!products || products.length === 0}>
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
           {loading.products ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
            ) : (
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
              {products && products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.imageUrl || 'https://placehold.co/64x64'}
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
                    { toDate(product.lastPurchaseDate).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                  <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" title="İade Al" onClick={() => makeReturn(product)}>
                        <Undo2 className="h-4 w-4" />
                        <span className="sr-only">İade Al</span>
                      </Button>
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
           )}
        </CardContent>
      </Card>
    </div>
  );
}
