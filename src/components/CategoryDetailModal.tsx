import { X, Calendar, FileText, DollarSign } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import type { Transaction } from '../types/types';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  month: string; // Format: "YYYY-MM"
  type: 'expense' | 'income';
}

export const CategoryDetailModal = ({ 
  isOpen, 
  onClose, 
  category, 
  month, 
  type 
}: CategoryDetailModalProps) => {
  const { transactions, getCategoryBudget } = useExpenseStore();

  if (!isOpen) return null;

  // Lọc giao dịch theo danh mục và tháng
  const [year, monthNum] = month.split('-').map(Number);
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return (
      t.category === category &&
      t.type === type &&
      date.getFullYear() === year &&
      date.getMonth() + 1 === monthNum
    );
  });

  // Tính tổng
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Lấy định mức (nếu là chi tiêu)
  const categoryBudget = type === 'expense' ? getCategoryBudget(category) : 0;
  const percentage = categoryBudget > 0 ? (totalAmount / categoryBudget) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Chi tiết {type === 'expense' ? 'chi tiêu' : 'thu nhập'}
            </h3>
            <p className="text-gray-600">
              {category} - Tháng {monthNum}/{year}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Thông tin tổng quan */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Tổng số giao dịch</div>
              <div className="text-2xl font-bold text-blue-800">
                {filteredTransactions.length}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${type === 'expense' ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className={`text-sm ${type === 'expense' ? 'text-red-600' : 'text-green-600'} mb-1`}>
                Tổng {type === 'expense' ? 'chi tiêu' : 'thu nhập'}
              </div>
              <div className={`text-2xl font-bold ${type === 'expense' ? 'text-red-800' : 'text-green-800'}`}>
                {totalAmount.toLocaleString()}đ
              </div>
            </div>

            {type === 'expense' && categoryBudget > 0 && (
              <>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 mb-1">Định mức</div>
                  <div className="text-2xl font-bold text-yellow-800">
                    {categoryBudget.toLocaleString()}đ
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  percentage > 100 ? 'bg-red-50' : 
                  percentage > 80 ? 'bg-yellow-50' : 
                  'bg-green-50'
                }`}>
                  <div className={`text-sm mb-1 ${
                    percentage > 100 ? 'text-red-600' : 
                    percentage > 80 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    Tỉ lệ sử dụng
                  </div>
                  <div className={`text-2xl font-bold ${
                    percentage > 100 ? 'text-red-800' : 
                    percentage > 80 ? 'text-yellow-800' : 
                    'text-green-800'
                  }`}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Danh sách chi tiết */}
        <div className="overflow-y-auto max-h-[400px]">
          <div className="px-6 py-4 border-b bg-gray-50 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500">
            <div className="col-span-2">Ngày</div>
            <div className="col-span-5">Ghi chú</div>
            <div className="col-span-3 text-right">Số tiền</div>
            <div className="col-span-2 text-center">Tỉ lệ</div>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>Không có giao dịch nào trong tháng này</p>
            </div>
          ) : (
            filteredTransactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((t, index) => (
                <div 
                  key={t.id} 
                  className="px-6 py-4 border-b hover:bg-gray-50 transition-colors grid grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">{t.date}</span>
                  </div>
                  
                  <div className="col-span-5">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{t.note || <span className="text-gray-400">Không có ghi chú</span>}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign size={16} className={`${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}`} />
                      <span className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      categoryBudget > 0 
                        ? (t.amount / categoryBudget * 100) > 10 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {categoryBudget > 0 
                        ? `${((t.amount / categoryBudget) * 100).toFixed(1)}%` 
                        : '-'
                      }
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Trung bình mỗi giao dịch: </span>
            <span className="font-bold">
              {(totalAmount / filteredTransactions.length || 0).toLocaleString('vi-VN', {
                maximumFractionDigits: 0
              })}đ
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};