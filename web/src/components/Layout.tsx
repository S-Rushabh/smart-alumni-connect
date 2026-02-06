import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
    LayoutDashboard,
    User,
    Users,
    Briefcase,
    Calendar,
    Heart,
    Trophy,
    MessageSquare,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { cn } from '../lib/utils'; // Ensure utility exists or create it

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Networking', href: '/networking', icon: Users },
        { name: 'Jobs', href: '/jobs', icon: Briefcase },
        { name: 'Events', href: '/events', icon: Calendar },
        { name: 'Donations', href: '/donations', icon: Heart },
        { name: 'Gamification', href: '/gamification', icon: Trophy },
        { name: 'Chat', href: '/chat', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-indigo-700 text-white">
                <div className="flex items-center justify-center h-16 border-b border-indigo-600">
                    <h1 className="text-xl font-bold">Smart Alumni</h1>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        isActive ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                    )}
                                >
                                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="p-4 border-t border-indigo-600">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">{user?.full_name}</p>
                            <p className="text-xs text-indigo-200 capitalize">{user?.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="ml-auto text-indigo-200 hover:text-white"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:pl-64">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between bg-indigo-700 text-white px-4 py-3">
                    <span className="font-bold">Smart Alumni</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-indigo-800 text-white px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600"
                            >
                                <div className="flex items-center">
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                        <button
                            onClick={logout}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600 text-red-300"
                        >
                            <div className="flex items-center">
                                <LogOut className="mr-3 h-5 w-5" />
                                Logout
                            </div>
                        </button>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
