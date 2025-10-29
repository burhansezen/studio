'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Car, LayoutDashboard, ShoppingCart, Archive, LogOut, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAppContext } from '@/context/AppContext';
import { useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Panel Özeti', icon: LayoutDashboard },
  { href: '/sales', label: 'Satış', icon: ShoppingCart },
  { href: '/inventory', label: 'Envanter', icon: Archive },
];

function PageHeader() {
  const pathname = usePathname();
  const { logout } = useAppContext();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:px-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            className="bg-primary/10 text-primary hover:bg-primary/20 size-10 rounded-lg"
            aria-label="Anasayfa"
          >
            <Car className="size-6" />
          </Button>
          <div className="flex flex-col">
            <h2 className="font-headline text-lg font-semibold tracking-tight text-foreground">
              SZN Auto
            </h2>
            <p className="text-xs text-foreground/70">
              Yönetim Paneli
            </p>
          </div>
        </Link>
      </div>
      <nav className="hidden items-center gap-2 md:flex">
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
            className="font-headline"
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
       <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>
    </header>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 sm:p-6 lg:p-8">{children}</div>;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgImage = PlaceHolderImages.find((p) => p.id === 'logo-background');
  const { user, isUserLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="relative min-h-screen">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover opacity-5 -z-10"
            data-ai-hint={bgImage.imageHint}
            priority
          />
        )}
        <PageHeader />
        <MainContent>{children}</MainContent>
      </div>
  );
}
