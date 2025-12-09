import { useState, useMemo } from 'react';
import { Search, Trash2, ArrowDownCircle, Filter, ChevronDown, ChevronRight, Calendar } from 'lucide-react'; // THÊM ICON CALENDAR
import { useExpenseStore } from '../store/useExpenseStore';
import { CategoryDetailModal } from '../components/CategoryDetailModal';
import type { Transaction } from '../types/types';

const Transactions = () => {
  const { transactions, removeTransaction, getCategoryBudget } = useExpenseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense'>('all'); 
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{
    category: string;
    month: string;
    type: 'expense';
  } | null>(null);

  // === STATE MỚI CHO BỘ LỌC NGÀY ===
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Hàm chuẩn hóa ngày để so sánh
  const normalizeDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).getTime();
  };

  // Logic lọc dữ liệu
  const filteredTransactions: Transaction[] = useMemo(() => {
      const startTimestamp = normalizeDate(startDate);
      const endTimestamp = normalizeDate(endDate);

      return transactions
        .filter((t) => {
            // 1. Loại bỏ Thu nhập
            if (t.type === 'income') return false; 
            
            const transactionTimestamp = normalizeDate(t.date);

            // 2. Lọc theo Ngày (Date Range)
            const matchesDateRange = 
                (!startTimestamp || transactionTimestamp >= startTimestamp) &&
                (!endTimestamp || transactionTimestamp <= endTimestamp + 86400000); // Thêm 1 ngày để bao gồm ngày kết thúc

            // 3. Lọc theo Từ khóa
            const matchesSearch = 
              t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              t.category.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 4. Lọc theo Loại (Expense - luôn là true vì đã lọc ở bước 1)
            const matchesType = filterType === 'all' || t.type === filterType;

            return matchesDateRange && matchesSearch && matchesType;
        });
  }, [transactions, searchTerm, filterType, startDate, endDate]);

  // Nhóm giao dịch theo danh mục và tháng (Logic giữ nguyên)
  const groupedTransactions = useMemo(() => {
    // ... (logic nhóm giao dịch giữ nguyên) ...
    const groups: Record<string, {
      category: string;
      type: 'expense';
      total: number;
      month: string; 
      monthDisplay: string;
      transactions: typeof transactions;
    }> = {};

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const groupKey = `${t.category}-${monthKey}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          category: t.category,
          type: 'expense',
          total: 0,
          month: monthKey,
          monthDisplay: `Tháng ${month}/${year}`,
          transactions: [],
        };
      }

      groups[groupKey].total += t.amount;
      groups[groupKey].transactions.push(t);
    });

    return Object.values(groups)
      .sort((a, b) => {
        if (a.month !== b.month) return b.month.localeCompare(a.month);
        return b.total - a.total;
      });
  }, [filteredTransactions]);

  // Toggle mở/đóng danh mục
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Xử lý xóa giao dịch
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    if (window.confirm('Bạn có chắc muốn xóa giao dịch này không?')) { 
      removeTransaction(id); 
    }
  };

  // Hàm mở modal xem chi tiết
  const handleViewDetails = (category: string, month: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory({ category, month, type: 'expense' });
  };
  
  const getCategoryBudgetFromStore = (category: string) => getCategoryBudget(category);


  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Sổ Thu Chi</h2>
        <p className="text-gray-500 text-sm mt-1">Quản lý chi tiết lịch sử giao dịch và phân tích theo nhóm.</p>
      </header>

      {/* Thanh công cụ: Tìm kiếm, Filter, và Date Range */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        
        {/* HÀNG 1: TÌM KIẾM */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo ghi chú, danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>

        {/* HÀNG 2: BỘ LỌC NGÀY & LOẠI */}
        <div className="flex flex-col md:flex-row items-center gap-3">
            
            {/* Bộ chọn ngày bắt đầu */}
            <div className="relative flex-1 w-full md:w-auto">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-gray-700 cursor-pointer"
                />
            </div>

            <span className="text-gray-500 hidden md:block">—</span>

            {/* Bộ chọn ngày kết thúc */}
            <div className="relative flex-1 w-full md:w-auto">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-gray-700 cursor-pointer"
                />
            </div>
            
            {/* Bộ lọc Chi (giữ nguyên) */}
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filterType === 'expense' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >
                   Chi
                </button>
            </div>
        </div>
      </div>

      {/* Danh sách giao dịch theo nhóm */}
      <div className="space-y-4">
        {groupedTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            <Filter className="mx-auto mb-3 opacity-20" size={48} />
            <p>Không tìm thấy giao dịch nào phù hợp với điều kiện lọc.</p>
          </div>
        ) : (
          groupedTransactions.map((group) => {
            const groupKey = `${group.category}-${group.month}`;
            const isExpanded = expandedCategories.includes(groupKey);
            
            return (
              <div key={groupKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => toggleCategory(groupKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-red-100 text-red-600`}>
                        <ArrowDownCircle size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {group.category}
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({group.monthDisplay})
                          </span>
                        </h3>
                        <p className="text-sm text-gray-500">
                          {group.transactions.length} giao dịch
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold text-red-500`}>
                        -{group.total.toLocaleString('vi-VN')} đ
                      </span>
                      <button
                        onClick={(e) => handleViewDetails(group.category, group.month, e)}
                        className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                      >
                        Xem chi tiết
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="text-gray-400" size={20} />
                      ) : (
                        <ChevronRight className="text-gray-400" size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Chi tiết giao dịch (chỉ hiển thị khi expanded) */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm text-gray-500 bg-gray-50">
                      <div className="col-span-2 font-semibold">Ngày</div>
                      <div className="col-span-5 font-semibold">Ghi chú</div>
                      <div className="col-span-3 font-semibold text-right">Số tiền</div>
                      <div className="col-span-2 font-semibold text-center">Hành động</div>
                    </div>
                    
                    {group.transactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((t) => (
                        <div key={t.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
                          <div className="col-span-2 text-sm text-gray-600">
                            {t.date}
                          </div>
                          <div className="col-span-5">
                            <div className="text-gray-800">{t.note || <span className="text-gray-400">Không có ghi chú</span>}</div>
                          </div>
                          <div className="col-span-3 text-right">
                            <span className={`text-sm font-bold text-red-500`}>
                              -{t.amount.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                          <div className="col-span-2 text-center">
                            <button 
                              onClick={(e) => handleDelete(t.id, e)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Xóa giao dịch"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    
                    {/* Tổng kết nhóm */}
                    <div className="p-4 bg-blue-50 border-t border-blue-100">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-blue-700">
                          Tổng cộng cho "{group.category}" trong {group.monthDisplay}:
                        </div>
                        <div className={`text-lg font-bold text-red-600`}>
                          -{group.total.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      
                      {/* Hiển thị định mức */}
                      {(() => {
                        const categoryBudget = getCategoryBudgetFromStore(group.category);
                        
                        if (categoryBudget > 0) {
                          const percentage = (group.total / categoryBudget) * 100;
                          const isOver = group.total > categoryBudget;
                          
                          return (
                            <div className="mt-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Định mức: {categoryBudget.toLocaleString()}đ</span>
                                <span className={`font-bold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
                                  {percentage.toFixed(1)}% sử dụng
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                                <div 
                                  className={`h-full ${
                                    isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                              </div>
                              {isOver && (
                                <div className="text-xs text-red-600 font-medium mt-1">
                                  ⚠️ Đã vượt định mức {Math.abs(categoryBudget - group.total).toLocaleString()}đ
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal xem chi tiết */}
      {selectedCategory && (
        <CategoryDetailModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          category={selectedCategory.category}
          month={selectedCategory.month}
        />
      )}
    </div>
  );
};

export default Transactions;