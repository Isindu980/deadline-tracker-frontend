'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import NotificationPopup from '@/components/notification-popup';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Menu, Target, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';


export default function DashboardNavbar({ setSidebarOpen }) {
  const { user, logout } = useAuth();

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.full_name) {
      const names = user.full_name.split(' ');
      const firstInitial = names[0]?.charAt(0) || '';
      const lastInitial = names[names.length - 1]?.charAt(0) || '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    return user.username?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
  <header className="glassmorphism-nav sticky top-0 z-50">
  <div className="flex items-center justify-between h-16 px-8 border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

   
        </div>

        <div className="flex items-center space-x-4">
          <NotificationPopup />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.full_name || user?.username} />
                  <AvatarFallback className="glassmorphism text-sm">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glassmorphism-modal border-0" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name || user?.username || 'User'}</p>
                  <p className="text-xs leading-none text-gray-600 dark:text-gray-400">{user?.email}</p>
                  {user?.role && (
                    <p className="text-xs leading-none text-blue-600 dark:text-blue-400 capitalize">{user.role}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
