import { Outlet, NavLink } from 'react-router-dom';
import { Home, Banknote, Wallet, PieChart, Settings } from 'lucide-react'; 
import { NotificationSystem } from '../components/NotificationSystem'; 

const MainLayout = () => {
  // Danh sách menu
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: <Home size={20} /> },  
    { path: '/transactions', label: 'Sổ thu chi', icon: <Wallet size={20} /> },
    { path: '/reports', label: 'Báo cáo', icon: <PieChart size={20} /> },
    { path: '/settings', label: 'Cấu hình', icon: <Settings size={20} /> },
  ];

  return (
    // Đổi nền chung thành màu xám nhạt (gray-50)
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* SIDEBAR TRÁI */}
      {/* Thêm shadow nổi bật và z-index cao */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full shadow-xl shadow-gray-200/40 z-20">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Banknote className="fill-blue-600 text-white" />
            JeemzzExpense
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/60 font-semibold' // Style khi đang chọn
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700' // Style bình thường
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-400">
          © 2025 Sinh viên PTIT
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH (BÊN PHẢI) */}
      <main className="flex-1 ml-64 p-6 transition-all duration-300">
        <div className="pt-2">
            <Outlet />
        </div>
      </main>
      
      {/* HỆ THỐNG THÔNG BÁO GLOBAL */}
      <NotificationSystem /> 
    </div>
  );
};

export default MainLayout;