'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Car, LayoutDashboard, ShoppingCart, Archive } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/dashboard', label: 'Panel Özeti', icon: LayoutDashboard },
  { href: '/sales', label: 'Satış', icon: ShoppingCart },
  { href: '/inventory', label: 'Envanter', icon: Archive },
];

function PageHeader() {
  const pathname = usePathname();
  const currentNav = navItems.find((item) => pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-headline font-semibold text-foreground">
          {currentNav?.label || 'SZN Auto Manager'}
        </h1>
      </div>
      {/* User menu can be added here */}
    </header>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bgImage = PlaceHolderImages.find((p) => p.id === 'logo-background');

  return (
    <SidebarProvider>
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
        <Sidebar>
          <SidebarHeader>
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
                <h2 className="font-headline text-lg font-semibold tracking-tight text-sidebar-foreground">
                  SZN Auto
                </h2>
                <p className="text-xs text-sidebar-foreground/70">
                  Yönetim Paneli
                </p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={{
                        children: item.label,
                        className: 'font-headline',
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <PageHeader />
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
