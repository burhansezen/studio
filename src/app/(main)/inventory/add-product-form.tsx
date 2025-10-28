'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Product } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Ürün adı en az 2 karakter olmalıdır.',
  }),
  stock: z.coerce.number().int().min(0, {
    message: 'Stok adedi 0 veya daha fazla olmalıdır.',
  }),
  price: z.coerce.number().min(0, {
    message: 'Fiyat 0 veya daha fazla olmalıdır.',
  }),
  compatibility: z.string().min(2, {
    message: 'Uyumluluk bilgisi en az 2 karakter olmalıdır.',
  }),
  imageUrl: z.string().url({ message: 'Lütfen geçerli bir resim URL\'si girin.' }),
});

type AddProductFormProps = {
  onAddProduct: (product: Omit<Product, 'id' | 'lastPurchaseDate'>) => void;
};

export function AddProductForm({ onAddProduct }: AddProductFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      stock: 0,
      price: 0,
      compatibility: '',
      imageUrl: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddProduct(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örn: 18' Alaşım Jant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stok Adedi</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Örn: 25" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fiyat (₺)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Örn: 15000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="compatibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uyumluluk</FormLabel>
              <FormControl>
                <Input placeholder="Örn: VW Golf, Audi A3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resim URL'si</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Ürünü Ekle</Button>
      </form>
    </Form>
  );
}
