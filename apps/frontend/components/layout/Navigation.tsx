'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shirt, History } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  {
    name: 'Homepage',
    href: '/homepage',
    icon: LayoutDashboard,
  },
  {
    name: 'Closet',
    href: '/closet',
    icon: Shirt,
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
  },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center gap-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-bold transition-all flex items-center gap-2 group ${
              isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon
              size={18}
              className={`transition-colors ${
                isActive ? 'text-slate-900' : 'group-hover:text-slate-900'
              }`}
            />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};
