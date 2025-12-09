import { useExpenseStore } from '../store/useExpenseStore';
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp  } from 'lucide-react';

export const CategoryBudgetStatus = () => {
    const { categoryBudgets, getTotalCategoryExpenses } = useExpenseStore();

    if (categoryBudgets.length === 0) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                <p className="text-sm">Chưa có định mức danh mục nào được thiết lập.</p>
                <p className="text-xs mt-1">Vui lòng vào Cấu hình để bắt đầu.</p>
            </div>
        );
    }
    
    // Lấy tháng và năm hiện tại
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Tính toán trạng thái chi tiêu cho từng danh mục
    const statusData = categoryBudgets.map(budget => {
        const spent = getTotalCategoryExpenses(budget.category, currentMonth, currentYear);
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
        
        let statusClass = 'bg-green-100 text-green-700';
        let icon = <CheckCircle size={16} className="text-green-500" />;
        
        if (spent > budget.limit) {
            statusClass = 'bg-red-100 text-red-700';
            icon = <TrendingUp size={16} className="text-red-500" />;
        } else if (percentage > 80) {
            statusClass = 'bg-yellow-100 text-yellow-700';
            icon = <AlertTriangle size={16} className="text-yellow-600" />;
        }

        return {
            category: budget.category,
            limit: budget.limit,
            spent,
            percentage,
            statusClass,
            icon
        };
    }).sort((a, b) => b.spent - a.spent); // Sắp xếp giảm dần theo số tiền đã chi

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <DollarSign size={20} className="text-gray-500"/>
                Định mức theo Danh mục (Tháng {currentMonth + 1})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {statusData.map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-800 flex items-center gap-2">
                                {item.icon} {item.category}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.statusClass}`}>
                                {item.percentage.toFixed(0)}%
                            </span>
                        </div>
                        
                        {/* Thanh tiến trình */}
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div 
                                className={`h-full transition-all duration-500 ${
                                    item.spent > item.limit ? 'bg-red-500' :
                                    item.percentage > 80 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                        </div>
                        
                        {/* Chi tiết số tiền */}
                        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                            <span className="font-medium">Đã chi: {item.spent.toLocaleString()}đ</span>
                            <span className="text-gray-400">ĐM: {item.limit.toLocaleString()}đ</span>
                        </div>
                        
                        {item.spent > item.limit && (
                             <span className="text-xs text-red-600 font-medium mt-1">
                                🚨 Vượt {Math.abs(item.limit - item.spent).toLocaleString()}đ
                             </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};