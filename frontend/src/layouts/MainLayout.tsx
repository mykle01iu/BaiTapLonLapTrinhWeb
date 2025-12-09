import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { NotificationSystem } from '../components/NotificationSystem';
import { AuthModal } from '../components/AuthModal'; 

const navigation = [
    { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { name: 'Sổ thu chi', href: '/transactions', icon: ReceiptText },
    { name: 'Báo cáo', href: '/reports', icon: BarChart3 },
    { name: 'Cấu hình', href: '/settings', icon: Settings },
];

export const MainLayout: React.FC = () => {
    const { isAuthenticated, user, logout } = useExpenseStore();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // Mở modal nếu chưa đăng nhập
    React.useEffect(() => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
        } else {
            setIsAuthModalOpen(false);
        }
    }, [isAuthenticated]);
    
    
    // Nếu chưa đăng nhập, chỉ hiển thị Modal xác thực
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <AuthModal 
                    isOpen={isAuthModalOpen} 
                    // Bắt buộc người dùng phải đăng nhập, nên onClose không làm gì
                    onClose={() => {}} 
                />
                <NotificationSystem /> 
            </div>
        );
    }
    

    // Đã đăng nhập, hiển thị giao diện chính
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar (Thanh điều hướng) */}
            <aside className="w-64 bg-white shadow-xl flex flex-col fixed h-full border-r border-gray-100">
                
                {/* Logo */}
                <div className="p-6 flex items-center justify-center border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-blue-600">JeemzzzExpense</h1>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Sidebar: User Info and Logout */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-lg">
                         <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <User size={18} />
                         </div>
                         <div className="text-sm">
                            <p className="font-semibold text-gray-800">{user?.username || 'Guest'}</p>
                            <p className="text-xs text-gray-500">Người dùng</p>
                         </div>
                    </div>
                    
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Đăng Xuất
                    </button>
                </div>
            </aside>
            
            {/* Content Area */}
            <main className="ml-64 flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            
            {/* Notification System */}
            <NotificationSystem />
        </div>
    );
};