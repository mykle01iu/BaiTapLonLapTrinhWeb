import { useExpenseStore } from '../store/useExpenseStore';

export const BudgetCard = () => {
  const {  
    // THAY THẾ: Gọi hàm tính tổng định mức danh mục
    getTotalCategoryLimit, 
    categoryBudgets, 
    getOverBudgetCategories, 
    getTotalExpenses 
  } = useExpenseStore();

  const budgetLimit = getTotalCategoryLimit(); // <--- Lấy tổng định mức mới từ Store

  // Tính tổng chi tháng hiện tại
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalSpent = getTotalExpenses();

  // Tính danh sách danh mục vượt định mức
  const overBudgetCategories = getOverBudgetCategories();

  // Tính phần trăm đã chi tổng (chỉ tính nếu budgetLimit > 0)
  const percentage = budgetLimit > 0 ? Math.min((totalSpent / budgetLimit) * 100, 100) : 0;
  
  // Logic đổi màu thanh tiến trình
  let colorClass = 'bg-green-500';
  if (budgetLimit === 0) colorClass = 'bg-gray-400';
  else if (totalSpent > budgetLimit) colorClass = 'bg-red-500';
  else if (percentage > 80) colorClass = 'bg-red-500';
  else if (percentage > 50) colorClass = 'bg-yellow-500';

  // Tính tổng định mức các danh mục (Vẫn cần để hiển thị)
  const totalCategoryBudget = categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">
            Ngân sách tháng {currentMonth + 1}/{currentYear}
          </h3>
          {budgetLimit === 0 ? (
             <p className="text-2xl font-bold text-red-500 mt-1">
                Chưa đặt Định mức!
             </p>
          ) : (
             <p className="text-2xl font-bold text-gray-800">
               {totalSpent.toLocaleString()} / <span className="text-gray-400 text-lg">{budgetLimit.toLocaleString()}</span> <span className="text-xs text-gray-400">VNĐ</span>
             </p>
          )}
        </div>
        
        {budgetLimit > 0 && (
          <div className="text-right">
            <span className={`text-sm font-bold ${totalSpent > budgetLimit ? 'text-red-600' : 'text-gray-600'}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full transition-all duration-500 ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Hiển thị thông tin định mức danh mục */}
      {categoryBudgets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Tổng Định mức:</span>
            <span className="text-sm font-bold text-gray-800">{totalCategoryBudget.toLocaleString()}đ</span>
          </div>
          
          {/* Loại bỏ cảnh báo "Tổng định mức danh mục vượt quá định mức tháng" vì chúng luôn bằng nhau */}
          
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
      {budgetLimit > 0 && totalSpent > budgetLimit && (
        <div className="mt-3 text-red-600 text-xs font-medium flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg">
          ⚠️ Cảnh báo: Bạn đã chi tiêu vượt quá tổng ngân sách tháng này!
        </div>
      )}
      
      {budgetLimit === 0 && (
         <div className="mt-3 text-yellow-600 text-xs font-medium flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
             ⚠️ Vui lòng vào Cấu hình để thiết lập định mức danh mục!
         </div>
      )}
    </div>
  );
};