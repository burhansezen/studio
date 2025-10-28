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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'Geçersiz e-posta adresi.' }).min(1, { message: 'E-posta gereklidir.' }),
  password: z.string().min(1, { message: 'Şifre gereklidir.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, isUserLoading } = useAppContext();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: LoginFormValues) {
    await login(values);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center gap-2.5 mb-4">
              <div
                className="bg-primary/10 text-primary flex items-center justify-center size-12 rounded-lg"
              >
                <Car className="size-7" />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-semibold tracking-tight text-foreground text-left">
                  SZN Auto
                </h2>
                <p className="text-sm text-foreground/70 text-left">
                  Yönetim Paneli
                </p>
              </div>
            </div>
          <CardTitle className="text-xl">Yönetici Girişi</CardTitle>
          <CardDescription>Devam etmek için giriş yapın.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı (E-posta)</FormLabel>
                    <FormControl>
                      <Input placeholder="szn@szn.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
