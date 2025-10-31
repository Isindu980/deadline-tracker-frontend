'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target, LayoutDashboard, Calendar, CheckSquare, Users, Settings, LogOut, Search } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard-sidebar';
import DashboardNavbar from '@/components/dashboard-navbar';

// Particles Background Component for Login Page
const ParticlesBackground = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20';
      particle.style.width = `${Math.random() * 4 + 1}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.animation = `float ${Math.random() * 20 + 10}s linear infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      document.getElementById('particles-container')?.appendChild(particle);
    };

    // Create 150 particles
    for (let i = 0; i < 150; i++) {
      createParticle();
    }

    // Cleanup function
    return () => {
      const container = document.getElementById('particles-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div id="particles-container" className="fixed inset-0 pointer-events-none z-0" />;
};

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard/overview',
    icon: LayoutDashboard
  },
  {
    name: 'Deadlines',
    href: '/dashboard/deadlines',
    icon: Calendar
  },
  {
    name: 'Friends',
    href: '/dashboard/friends',
    icon: Users
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <ParticlesBackground />
  {/* Shared Navbar (header) */}
  <DashboardNavbar setSidebarOpen={setSidebarOpen} />

  {/* Sidebar */}
  <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} items={sidebarItems} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

  {/* Main content (pad top to account for sticky header) */}
  <div className="lg:pl-64 pt-0">
          {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}