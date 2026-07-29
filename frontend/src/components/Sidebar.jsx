import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Megaphone, Settings, LogOut, Scissors, Users } from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/catalog', label: 'Services', icon: BookOpen },
    { path: '/broadcast', label: 'Broadcast', icon: Megaphone },
    { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const { shop, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden md:flex w-64 bg-gray-900 border-r border-gray-800 flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                            <Scissors size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">
                                {shop?.businessName}
                            </p>
                            <p className="text-gray-400 text-xs">Shop Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                                    isActive
                                        ? 'bg-green-500/10 text-green-400 font-medium'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex md:hidden z-50">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center py-3 text-xs transition-all ${
                                isActive
                                    ? 'text-green-400'
                                    : 'text-gray-500'
                            }`
                        }
                    >
                        <Icon size={20} />
                        <span className="mt-1">{label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex-1 flex flex-col items-center justify-center py-3 text-xs text-gray-500"
                >
                    <LogOut size={20} />
                    <span className="mt-1">Logout</span>
                </button>
            </div>
        </>
    );
}