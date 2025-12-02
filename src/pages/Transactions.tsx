import { useState } from 'react';
import { Search, Trash2, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';

const Transactions = () => {
  const { transactions, removeTransaction } = useExpenseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  // Logic lọc dữ liệu: Vừa theo từ khóa tìm kiếm, vừa theo loại (Thu/Chi)
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || t.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa giao dịch này không?')) {
      removeTransaction(id);
    }
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

      {/* Danh sách giao dịch */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Filter className="mx-auto mb-3 opacity-20" size={48} />
            <p>Không tìm thấy giao dịch nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4">Danh mục & Ghi chú</th>
                  <th className="px-6 py-4 text-right">Số tiền</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      {t.type === 'income' ? (
                        <ArrowUpCircle className="text-green-500" size={24} />
                      ) : (
                        <ArrowDownCircle className="text-red-500" size={24} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{t.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{t.category}</div>
                      <div className="text-sm text-gray-500">{t.note}</div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                      {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa giao dịch"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;