'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const baseSchema = z.object({
  name: z.string().min(2, {
    message: 'Ürün adı en az 2 karakter olmalıdır.',
  }),
  stock: z.coerce.number().int().min(0, {
    message: 'Stok adedi 0 veya daha fazla olmalıdır.',
  }),
  purchasePrice: z.coerce.number().min(0, {
    message: 'Alış fiyatı 0 veya daha fazla olmalıdır.',
  }),
  sellingPrice: z.coerce.number().min(0, {
    message: 'Satış fiyatı 0 veya daha fazla olmalıdır.',
  }),
  compatibility: z.string().min(2, {
    message: 'Uyumluluk bilgisi en az 2 karakter olmalıdır.',
  }),
  lastPurchaseDate: z.date({
    required_error: "Son alım tarihi gereklidir.",
  }),
});

const imageSchema = z.custom<FileList>()
  .refine((files) => files && files.length > 0, 'Resim dosyası gereklidir.')
  .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Maksimum dosya boyutu 5MB'dir.`)
  .refine(
    (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
    ".jpg, .jpeg, .png ve .webp formatları desteklenmektedir."
  );

const formSchema = baseSchema.extend({ image: imageSchema });
const editFormSchema = baseSchema.extend({ image: imageSchema.optional() });

export type ProductFormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  onSubmit: (values: ProductFormValues) => void;
  product?: Product | null;
};

export function ProductForm({ onSubmit, product }: ProductFormProps) {
  const currentSchema = product ? editFormSchema : formSchema;
  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: '',
      stock: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      compatibility: '',
      image: undefined,
      lastPurchaseDate: new Date(),
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        stock: product.stock,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        compatibility: product.compatibility,
        image: undefined,
        lastPurchaseDate: product.lastPurchaseDate.toDate(),
      });
    } else {
       form.reset({
        name: '',
        stock: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        compatibility: '',
        image: undefined,
        lastPurchaseDate: new Date(),
      });
    }
  }, [product, form]);

  const fileRef = form.register("image");

  function handleFormSubmit(values: z.infer<typeof currentSchema>) {
    onSubmit(values as ProductFormValues);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
          name="purchasePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alış Fiyatı (₺)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Örn: 12000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sellingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satış Fiyatı (₺)</FormLabel>
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
          name="lastPurchaseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Son Alım Tarihi</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Bir tarih seçin</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resim {product && "(Değiştirmek istemiyorsanız boş bırakın)"}</FormLabel>
              <FormControl>
                <Input type="file" accept="image/png, image/jpeg" {...fileRef} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
            {product ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
        </Button>
      </form>
    </Form>
  );
}

    