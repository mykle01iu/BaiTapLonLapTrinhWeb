import { useState, useEffect } from 'react';
import { Save, Trash2, AlertTriangle, Plus, Edit2, X } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import type { CategoryBudget } from '../types/types';

const Settings = () => {
  const { 
    budgetLimit, 
    setBudget, 
    categoryBudgets, 
    setCategoryBudgets,
    addCategoryBudget, 
    updateCategoryBudget, 
    removeCategoryBudget 
  } = useExpenseStore();
  
  const [limitInput, setLimitInput] = useState(budgetLimit.toString());
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryLimit, setCategoryLimit] = useState('');

  // Danh sách danh mục có sẵn
  const availableCategories = [
    'Ăn uống', 'Di chuyển', 'Thuê nhà', 'Giải trí', 'Mua sắm', 
    'Y tế', 'Giáo dục', 'Hóa đơn', 'Khác'
  ];

  useEffect(() => {
    setLimitInput(budgetLimit.toString());
  }, [budgetLimit]);

  const handleSave = () => {
    const value = Number(limitInput);
    if (value > 0) {
      setBudget(value);
      alert('Đã cập nhật định mức chi tiêu thành công!');
    } else {
      alert('Vui lòng nhập số tiền hợp lệ!');
    }
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu không? Hành động này không thể hoàn tác!')) {
      localStorage.removeItem('expense-storage');
      window.location.reload();
    }
  };

  const handleOpenModal = (category?: string) => {
    if (category) {
      const budget = categoryBudgets.find(cb => cb.category === category);
      setEditingCategory(category);
      setCategoryName(category);
      setCategoryLimit(budget ? budget.limit.toString() : '');
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryLimit('');
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName || !categoryLimit) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const limit = Number(categoryLimit);
    if (limit <= 0) {
      alert('Định mức phải lớn hơn 0!');
      return;
    }

    if (editingCategory) {
      updateCategoryBudget(categoryName, limit);
    } else {
      addCategoryBudget(categoryName, limit);
    }

    setCategoryModalOpen(false);
    setCategoryName('');
    setCategoryLimit('');
    setEditingCategory(null);
    
    alert(`Đã ${editingCategory ? 'cập nhật' : 'thêm'} định mức cho "${categoryName}"!`);
  };

  const handleDeleteCategory = (category: string) => {
    if (confirm(`Bạn có chắc muốn xóa định mức cho "${category}"?`)) {
      removeCategoryBudget(category);
    }
  };

  // Thêm định mức mẫu
  const handleAddSampleBudgets = () => {
    const sampleBudgets: CategoryBudget[] = [
      { category: 'Ăn uống', limit: 3000000 },
      { category: 'Di chuyển', limit: 1000000 },
      { category: 'Thuê nhà', limit: 4000000 },
      { category: 'Giải trí', limit: 1000000 },
      { category: 'Mua sắm', limit: 2000000 },
    ];
    
    // Thêm chỉ những danh mục chưa có định mức
    const existingCategories = categoryBudgets.map(cb => cb.category);
    const newBudgets = sampleBudgets.filter(
      budget => !existingCategories.includes(budget.category)
    );
    
    if (newBudgets.length > 0) {
      setCategoryBudgets([...categoryBudgets, ...newBudgets]);
      alert(`Đã thêm ${newBudgets.length} định mức mẫu!`);
    } else {
      alert('Tất cả định mức mẫu đã được thêm trước đó!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Cấu hình hệ thống</h2>
        <p className="text-gray-500 text-sm">Thiết lập các thông số cho ứng dụng</p>
      </div>

      {/* Card 1: Định mức tổng */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          💰 Định mức chi tiêu tổng tháng
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tổng ngân sách hàng tháng (VNĐ)
            </label>
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-bold text-gray-800"
              min="0"
            />
            <p className="mt-2 text-xs text-gray-500">
              * Hệ thống sẽ cảnh báo khi tổng chi tiêu vượt quá số tiền này.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Save size={18} /> Lưu định mức tổng
          </button>
        </div>
      </div>

      {/* Card 2: Định mức theo danh mục */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              📊 Định mức theo danh mục
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Thiết lập giới hạn chi tiêu cho từng danh mục cụ thể
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSampleBudgets}
              className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Thêm mẫu
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Thêm mới
            </button>
          </div>
        </div>

        {categoryBudgets.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="mb-2">Chưa có định mức nào được thiết lập</p>
            <p className="text-sm mb-4">Nhấn "Thêm mẫu" để sử dụng định mức mẫu hoặc "Thêm mới" để tạo định mức riêng</p>
            <button
              onClick={handleAddSampleBudgets}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              Sử dụng định mức mẫu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryBudgets.map((budget, index) => {
              const spent = useExpenseStore.getState().getTotalCategoryExpenses(budget.category);
              const percentage = useExpenseStore.getState().getCategoryExpensePercentage(budget.category);
              
              let colorClass = 'bg-green-500';
              let textColor = 'text-green-600';
              if (percentage > 100) {
                colorClass = 'bg-red-500';
                textColor = 'text-red-600';
              } else if (percentage > 80) {
                colorClass = 'bg-yellow-500';
                textColor = 'text-yellow-600';
              }

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-800">{budget.category}</h4>
                        <span className={`text-sm font-bold ${textColor}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        Định mức: <span className="font-bold">{budget.limit.toLocaleString()}đ</span> | 
                        Đã chi: <span className="font-bold">{spent.toLocaleString()}đ</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => handleOpenModal(budget.category)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(budget.category)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClass} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  {percentage > 100 && (
                    <div className="mt-2 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                      ⚠️ Đã vượt {((percentage - 100).toFixed(1))}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>💡 <strong>Mẹo:</strong> Bạn có thể đặt định mức cho các danh mục chi tiêu chính như ăn uống, di chuyển, thuê nhà, giải trí...</p>
        </div>
      </div>

      {/* Card 3: Tóm tắt định mức */}
      {categoryBudgets.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            📋 Tóm tắt định mức
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Tổng định mức danh mục</div>
              <div className="text-2xl font-bold text-blue-800">
                {categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0).toLocaleString()}đ
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Tổng định mức tháng</div>
              <div className="text-2xl font-bold text-green-800">
                {budgetLimit.toLocaleString()}đ
              </div>
            </div>
          </div>
          
          {categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0) > budgetLimit && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 text-sm">
                <AlertTriangle size={16} />
                <span>Tổng định mức danh mục ({categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0).toLocaleString()}đ) lớn hơn định mức tháng ({budgetLimit.toLocaleString()}đ)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal thêm/sửa định mức */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCategory ? 'Sửa định mức' : 'Thêm định mức mới'}
              </h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                {editingCategory ? (
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Nhập tên danh mục"
                  />
                ) : (
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white cursor-pointer"
                  >
                    <option value="">Chọn danh mục</option>
                    {availableCategories
                      .filter(cat => !categoryBudgets.find(cb => cb.category === cat))
                      .map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    <option value="custom">Tự nhập danh mục mới...</option>
                  </select>
                )}
                
                {categoryName === 'custom' && (
                  <input
                    type="text"
                    value={categoryName === 'custom' ? '' : categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Nhập tên danh mục mới"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Định mức (VNĐ)
                </label>
                <input
                  type="number"
                  value={categoryLimit}
                  onChange={(e) => setCategoryLimit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-bold"
                  placeholder="Nhập số tiền"
                  min="1000"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">* Nhập số tiền tối thiểu 1,000đ</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Save size={18} /> {editingCategory ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 4: Vùng nguy hiểm */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} /> Vùng nguy hiểm
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Xóa toàn bộ dữ liệu giao dịch, định mức và đưa ứng dụng về trạng thái ban đầu.
        </p>
        <button
          onClick={handleResetData}
          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Trash2 size={18} /> Xóa tất cả dữ liệu & Reset App
        </button>
      </div>
    </div>
  );
};

export default Settings;