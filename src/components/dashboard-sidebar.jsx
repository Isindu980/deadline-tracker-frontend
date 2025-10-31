'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target, X, ChevronRight, Zap, Clock, Users, Settings, LayoutDashboard, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Deadlines', href: '/dashboard/deadlines', icon: Calendar },
    { name: 'Friends', href: '/dashboard/friends', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings }
];

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen, items = null }) {
    const pathname = usePathname();
    const list = items || sidebarItems;
    const { logout } = useAuth();

    // Find active item index for the background indicator
    const activeIndex = list.findIndex(item =>
        pathname === item.href || pathname.startsWith(item.href + '/dashboard')
    );

    // Refs to measure active item's position/height
    const containerRef = useRef(null);
    const itemRefs = useRef([]);
    const [activeTop, setActiveTop] = useState(-9999);
    const [activeHeight, setActiveHeight] = useState(0);

    const measureActive = () => {
        const el = itemRefs.current[activeIndex];
        const parent = containerRef.current;
        if (!el || !parent) {
            setActiveTop(-9999);
            setActiveHeight(0);
            return;
        }

        // Use bounding rects for accurate measurements even when elements are transformed
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const top = elRect.top - parentRect.top + parent.scrollTop;
        const height = elRect.height || 48;
        setActiveTop(top);
        setActiveHeight(height);
    };

    useEffect(() => {
        measureActive();
        const onResize = () => {
            // re-measure when viewport changes
            measureActive();
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
        // include pathname and sidebarOpen so we remeasure when navigation or toggle occurs
    }, [activeIndex, pathname, sidebarOpen]);

    const handleSignOut = () => {

    }

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 glassmorphism-sidebar border-r border-gray-200 dark:border-gray-800/50 backdrop-blur-md transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}>

            {/* Header with Enhanced Design */}
            <div className="flex items-center justify-between h-16 px-8 border-b border-gray-200 dark:border-gray-800/50">
                <Link href="/" className="flex items-center space-x-3 group">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="flex items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
                    >
                        <Target className="h-4 w-4 text-white" />
                    </motion.div>
                    <div className="flex flex-col justify-center">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                            DeadlineTracker
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400  transition-opacity duration-300 leading-tight">
                            Stay productive
                        </div>
                    </div>
                </Link>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden hover:bg-white/10 dark:hover:bg-black/10 rounded-lg flex items-center justify-center"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Navigation with Enhanced UI */}
            <nav ref={containerRef} className="mt-8 px-4 flex-1 overflow-y-auto">
                <div className="relative">
                    {/* Single active item background indicator */}
                    <AnimatePresence>
                        {activeIndex !== -1 && (
                            <motion.div
                                key="activeBackground"
                                layoutId="activeBackground"
                                className="absolute left-0 right-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/20"
                                initial={false}
                                animate={{
                                    y: activeTop,
                                    height: activeHeight || 48
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </AnimatePresence>

                    <ul className="space-y-2 relative">
                        {list.map((item, index) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;

                            return (
                                <motion.li
                                    ref={(el) => (itemRefs.current[index] = el)}
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`group flex items-center justify-between space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${isActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className={`p-2 rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 group-hover:bg-blue-500/20 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                }`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium truncate">{item.name}</span>
                                        </div>

                                        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'
                                            }`} />
                                    </Link>
                                </motion.li>
                            );
                        })}
                    </ul>
                </div>
            </nav>

            {/* Enhanced Footer Section */}
            <div className="p-6 border-t border-white/10 dark:border-gray-800/50 mt-auto">


                {/* Quick Actions */}
                <div className="flex space-x-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 glassmorphism-button text-xs hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-600"
                    >
                        <Link href="/dashboard/settings">
                            <Settings className="h-3 w-3 mr-1" />
                            Settings
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={logout}
                        className="flex-1 glassmorphism-button text-xs hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600"
                    >
                        <span>Sign Out</span>
                    </Button>
                </div>
            </div>
        </aside>
    );
}