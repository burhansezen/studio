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

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
  image: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, 'Resim dosyası gereklidir.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Maksimum dosya boyutu 5MB'dir.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png ve .webp formatları desteklenmektedir."
    ),
});

type AddProductFormProps = {
  onAddProduct: (product: Omit<Product, 'id' | 'lastPurchaseDate' | 'imageUrl'> & { image: File }) => void;
};

export function AddProductForm({ onAddProduct }: AddProductFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      stock: 0,
      price: 0,
      compatibility: '',
      image: undefined,
    },
  });

  const fileRef = form.register("image");

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddProduct({ ...values, image: values.image[0] });
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
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resim</FormLabel>
              <FormControl>
                <Input type="file" accept="image/png, image/jpeg" {...fileRef} />
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
