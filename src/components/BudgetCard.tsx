import { useExpenseStore } from '../store/useExpenseStore';

export const BudgetCard = () => {
  const { transactions, budgetLimit } = useExpenseStore();

  // --- LOGIC MỚI: Chỉ tính tổng tiền của THÁNG HIỆN TẠI ---
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Tháng 1, 10 = Tháng 11
  const currentYear = now.getFullYear();

  const totalSpent = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === 'expense' && // Phải là khoản chi
        tDate.getMonth() === currentMonth && // Phải trùng tháng hiện tại
        tDate.getFullYear() === currentYear // Phải trùng năm hiện tại
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);
  // ---------------------------------------------------------

  // Tính phần trăm đã chi
  const percentage = Math.min((totalSpent / budgetLimit) * 100, 100);
  
  // Logic đổi màu
  let colorClass = 'bg-green-500';
  if (percentage > 80) colorClass = 'bg-red-500';
  else if (percentage > 50) colorClass = 'bg-yellow-500';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">
            Ngân sách tháng {currentMonth + 1}/{currentYear}
          </h3>
          <p className="text-2xl font-bold text-gray-800">
            {totalSpent.toLocaleString()} / <span className="text-gray-400 text-lg">{budgetLimit.toLocaleString()}</span> <span className="text-xs text-gray-400">VNĐ</span>
          </p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${percentage > 100 ? 'text-red-600' : 'text-gray-600'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {totalSpent > budgetLimit && (
        <div className="mt-3 text-red-600 text-xs font-medium flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg">
          ⚠️ Cảnh báo: Bạn đã chi tiêu vượt quá ngân sách tháng này!
        </div>
      )}
    </div>
  );
};