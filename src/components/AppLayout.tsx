'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { FilePlus2 } from 'lucide-react';


const menuItems = [
  { href: '/create-report', label: 'Criar Laudo', icon: FilePlus2 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-headline text-primary font-bold transition-all group-data-[collapsible=icon]:-ml-8 group-data-[collapsible=icon]:opacity-0">
              VETLD
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                                        tooltip={item.label}
                    isActive={pathname === item.href}
                  >
                    <a className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b md:justify-end">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground hidden md:block">Dr. Veterinário</p>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-background/50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
