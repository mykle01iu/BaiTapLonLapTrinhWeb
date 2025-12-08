import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { BudgetCard } from '../components/BudgetCard';
import { ExpenseChart } from '../components/ExpenseChart';
import { CategoryBudgetStatus } from '../components/CategoryBudgetStatus';
import { NavLink } from 'react-router-dom';

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { 
        transactions, 
        getCategoryBudget, 
        getTotalCategoryExpenses 
    } = useExpenseStore();

    // Dùng useMemo để tính toán warning map
    const transactionWarnings = useMemo(() => {
        const warnings: Record<string, JSX.Element | null> = {};
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        transactions.forEach(t => {
            let warning: JSX.Element | null = null;
            
            if (t.type === 'expense') {
                const budget = getCategoryBudget(t.category);
                const tDate = new Date(t.date);
                
                if (budget > 0 && 
                    tDate.getMonth() === currentMonth && 
                    tDate.getFullYear() === currentYear) {
                    
                    const spent = getTotalCategoryExpenses(t.category, currentMonth, currentYear);
                    const percentage = (spent / budget) * 100;
                    
                    if (percentage > 100) {
                        warning = <span className="text-xs text-red-500 font-bold" title="Đã vượt định mức">⚠️</span>;
                    } else if (percentage > 80) {
                        warning = <span className="text-xs text-yellow-500 font-bold" title="Gần vượt định mức">⚠️</span>;
                    }
                }
            }
            warnings[t.id] = warning;
        });

        return warnings;
    }, [transactions, getCategoryBudget, getTotalCategoryExpenses]);


    return (
        <div className="space-y-6 pb-10">
            {/* 1. Header: Tiêu đề + Nút thêm mới */}
            <header className="mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Tổng quan tài chính</h2>
                    <p className="text-gray-500 text-sm mt-1">Nắm bắt chi tiêu nhanh chóng trong tháng này.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-300/60 flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Plus size={20} />
                    Thêm khoản chi
                </button>
            </header>

            {/* 2. GRID LAYOUT: Chia màn hình làm 3 cột */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CỘT PHẢI (Chiếm 1 phần): Ngân sách & Biểu đồ -> Đặt lên đầu */}
                <div className="space-y-6 flex flex-col lg:col-span-1">
                    <BudgetCard /> 
                    <ExpenseChart /> 
                </div>

                {/* CỘT TRÁI (Chiếm 2 phần): Giao dịch gần đây và Trạng thái Định mức */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Bảng giao dịch gần đây */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-700">Giao dịch gần đây</h3>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                {transactions.length} bản ghi
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Ngày</th>
                                        <th className="px-6 py-4">Danh mục</th>
                                        <th className="px-6 py-4">Ghi chú</th>
                                        <th className="px-6 py-4 text-right">Số tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span>📭 Chưa có giao dịch nào</span>
                                                    <span className="text-xs">Hãy bấm nút "Thêm khoản chi" ở trên</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.slice(0, 10).map((t) => ( 
                                            <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{t.date}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs border border-gray-200">
                                                            {t.category}
                                                        </span>
                                                        {transactionWarnings[t.id]}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate" title={t.note}>
                                                    {t.note || '-'}
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString('vi-VN')} đ
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Nút xem tất cả ở dưới bảng */}
                        <div className="p-4 border-t border-gray-100 text-center">
                             <NavLink to="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                Xem tất cả giao dịch →
                            </NavLink>
                        </div>
                    </div>
                    
                    {/* Component trạng thái định mức danh mục */}
                    <CategoryBudgetStatus /> 

                </div>
            </div>

            {/* Modal nhập liệu */}
            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;