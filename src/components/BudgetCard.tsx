import { useExpenseStore } from '../store/useExpenseStore';

export const BudgetCard = () => {
  const { transactions, budgetLimit, categoryBudgets, getTotalCategoryExpenses } = useExpenseStore();

  // Tính tổng chi tháng hiện tại
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalSpent = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Tính danh sách danh mục vượt định mức
  const overBudgetCategories = categoryBudgets
    .map(budget => {
      const spent = getTotalCategoryExpenses(budget.category, currentMonth, currentYear);
      return { ...budget, spent };
    })
    .filter(item => item.spent > item.limit);

  // Tính phần trăm đã chi tổng
  const percentage = Math.min((totalSpent / budgetLimit) * 100, 100);
  
  // Logic đổi màu thanh tiến trình
  let colorClass = 'bg-green-500';
  if (percentage > 80) colorClass = 'bg-red-500';
  else if (percentage > 50) colorClass = 'bg-yellow-500';

  // Tính tổng định mức các danh mục
  const totalCategoryBudget = categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0);

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

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full transition-all duration-500 ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Hiển thị thông tin định mức danh mục */}
      {categoryBudgets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Định mức danh mục:</span>
            <span className="text-sm font-bold text-gray-800">{totalCategoryBudget.toLocaleString()}đ</span>
          </div>
          
          {totalCategoryBudget > budgetLimit && (
            <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded mb-3">
              ⚠️ Tổng định mức danh mục vượt quá định mức tháng
            </div>
          )}
          
          {/* Hiển thị cảnh báo vượt định mức từng danh mục */}
          {overBudgetCategories.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-red-600">⚠️ Đã vượt định mức:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                {overBudgetCategories.map((cat, index) => {
                  const overAmount = cat.spent - cat.limit;
                  const percentage = (cat.spent / cat.limit) * 100;
                  
                  return (
                    <div key={index} className="flex justify-between items-center text-xs bg-red-50 px-3 py-1.5 rounded">
                      <span className="font-medium truncate max-w-[120px]">{cat.category}</span>
                      <div className="text-right">
                        <span className="text-red-700 font-bold">
                          +{overAmount.toLocaleString()}đ
                        </span>
                        <span className="text-red-600 text-xs ml-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cảnh báo vượt tổng định mức */}
      {totalSpent > budgetLimit && (
        <div className="mt-3 text-red-600 text-xs font-medium flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg">
          ⚠️ Cảnh báo: Bạn đã chi tiêu vượt quá tổng ngân sách tháng này!
        </div>
      )}
    </div>
  );
};