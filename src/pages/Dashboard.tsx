import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { BudgetCard } from '../components/BudgetCard';
import { ExpenseChart } from '../components/ExpenseChart';

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { transactions } = useExpenseStore();

    return (
        <div className="space-y-6 pb-10">
            {/* 1. Header: Tiêu đề + Nút thêm mới */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Tổng quan tài chính</h2>
                    <p className="text-gray-500 text-sm">Quản lý chi tiêu hiệu quả với DinhKhaiQuanLy</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    Thêm khoản chi
                </button>
            </div>

            {/* 2. GRID LAYOUT: Chia màn hình làm 2 cột */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CỘT TRÁI (Chiếm 2 phần): Danh sách giao dịch */}
                <div className="lg:col-span-2 space-y-6">
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
                                        transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{t.date}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs border border-gray-200">
                                                        {t.category}
                                                    </span>
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
                    </div>
                </div>

                {/* CỘT PHẢI (Chiếm 1 phần): Ngân sách & Biểu đồ */}
                <div className="space-y-6 flex flex-col">
                    {/* Component Thanh Ngân sách */}
                    <BudgetCard />

                    {/* Component Biểu đồ tròn */}
                    <ExpenseChart />
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