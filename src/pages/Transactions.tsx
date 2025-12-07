import { useState, useMemo } from 'react';
import { Search, Trash2, ArrowUpCircle, ArrowDownCircle, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { CategoryDetailModal } from '../components/CategoryDetailModal';

const Transactions = () => {
  const { transactions, removeTransaction } = useExpenseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{
    category: string;
    month: string;
    type: 'expense' | 'income';
  } | null>(null);

  // Logic lọc dữ liệu
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || t.type === filterType;

    return matchesSearch && matchesType;
  });

  // Nhóm giao dịch theo danh mục và tháng
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, {
      category: string;
      type: 'expense' | 'income';
      total: number;
      month: string; // Format: "YYYY-MM"
      monthDisplay: string; // Format: "Tháng MM/YYYY"
      transactions: typeof transactions;
    }> = {};

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const monthDisplay = `Tháng ${month}/${year}`;
      const groupKey = `${t.category}-${monthKey}-${t.type}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          category: t.category,
          type: t.type,
          total: 0,
          month: monthKey,
          monthDisplay,
          transactions: [],
        };
      }

      groups[groupKey].total += t.amount;
      groups[groupKey].transactions.push(t);
    });

    // Sắp xếp các nhóm theo tháng (mới nhất trước) và tổng tiền
    return Object.values(groups)
      .sort((a, b) => {
        if (a.month !== b.month) return b.month.localeCompare(a.month);
        if (a.type !== b.type) return a.type === 'expense' ? -1 : 1;
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
    e.stopPropagation(); // Ngăn chặn toggle khi click xóa
    if (window.confirm('Bạn có chắc muốn xóa giao dịch này không?')) {
      removeTransaction(id);
    }
  };

  // Hàm mở modal xem chi tiết
  const handleViewDetails = (category: string, month: string, type: 'expense' | 'income', e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory({ category, month, type });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sổ thu chi</h2>
          <p className="text-gray-500 text-sm">Quản lý chi tiết lịch sử giao dịch</p>
        </div>
      </div>

      {/* Thanh công cụ: Tìm kiếm & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        {/* Ô tìm kiếm */}
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

        {/* Bộ lọc Thu/Chi */}
        <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filterType === 'income' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
            >
              Thu
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filterType === 'expense' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
            >
               Chi
            </button>
        </div>
      </div>

      {/* Danh sách giao dịch theo nhóm */}
      <div className="space-y-4">
        {groupedTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            <Filter className="mx-auto mb-3 opacity-20" size={48} />
            <p>Không tìm thấy giao dịch nào phù hợp.</p>
          </div>
        ) : (
          groupedTransactions.map((group) => {
            const groupKey = `${group.category}-${group.month}-${group.type}`;
            const isExpanded = expandedCategories.includes(groupKey);
            
            return (
              <div key={groupKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header của nhóm */}
                <div 
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => toggleCategory(groupKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        group.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {group.type === 'income' ? (
                          <ArrowUpCircle size={20} />
                        ) : (
                          <ArrowDownCircle size={20} />
                        )}
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
                      <span className={`text-lg font-bold ${
                        group.type === 'expense' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {group.type === 'expense' ? '-' : '+'}{group.total.toLocaleString('vi-VN')} đ
                      </span>
                      <button
                        onClick={(e) => handleViewDetails(group.category, group.month, group.type, e)}
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
                            <span className={`text-sm font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                              {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString('vi-VN')} đ
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
                        <div className={`text-lg font-bold ${
                          group.type === 'expense' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {group.type === 'expense' ? '-' : '+'}{group.total.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      
                      {/* Hiển thị định mức nếu có (chỉ cho chi tiêu) */}
                      {group.type === 'expense' && (() => {
                        const getCategoryBudget = useExpenseStore.getState().getCategoryBudget;
                        const categoryBudget = getCategoryBudget(group.category);
                        
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
          type={selectedCategory.type}
        />
      )}
    </div>
  );
};

export default Transactions;