import { useState, useEffect } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';

const Settings = () => {
  const { budgetLimit, setBudget } = useExpenseStore();
  
  // State lưu tạm số tiền đang nhập
  const [limitInput, setLimitInput] = useState(budgetLimit.toString());

  // Cập nhật input khi dữ liệu từ store thay đổi
  useEffect(() => {
    setLimitInput(budgetLimit.toString());
  }, [budgetLimit]);

  const handleSave = () => {
    const value = Number(limitInput);
    if (value > 0) {
      setBudget(value);
      alert('Đã cập nhật định mức chi tiêu thành công!');
    }
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu không? Hành động này không thể hoàn tác!')) {
      localStorage.removeItem('expense-storage'); // Xóa key trong LocalStorage
      window.location.reload(); // Tải lại trang để reset về trắng tinh
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Cấu hình hệ thống</h2>
        <p className="text-gray-500 text-sm">Thiết lập các thông số cho ứng dụng</p>
      </div>

      {/* Card 1: Cài đặt ngân sách */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          💰 Định mức chi tiêu
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngân sách hàng tháng (VNĐ)
            </label>
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-bold text-gray-800"
            />
            <p className="mt-2 text-xs text-gray-500">
              * Hệ thống sẽ cảnh báo khi bạn chi tiêu vượt quá số tiền này.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Save size={18} /> Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Card 2: Vùng nguy hiểm (Reset App) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} /> Vùng nguy hiểm
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Xóa toàn bộ dữ liệu giao dịch và đưa ứng dụng về trạng thái ban đầu. Sử dụng khi bạn muốn demo lại từ đầu.
        </p>
        <button
          onClick={handleResetData}
          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Trash2 size={18} /> Xóa dữ liệu & Reset App
        </button>
      </div>
    </div>
  );
};

export default Settings;