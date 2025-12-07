import { useState, useEffect } from 'react';
import { X, Check, Wallet } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal = ({ isOpen, onClose }: Props) => {
  const addTransaction = useExpenseStore((state) => state.addTransaction);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const expenseCategories = [
    'Ăn uống', 'Di chuyển', 'Thuê nhà', 'Giải trí', 'Mua sắm', 'Y tế', 'Giáo dục', 'Hóa đơn'
  ];

  const currentCategories = expenseCategories;

  useEffect(() => {
    setCategory(currentCategories[0]);
    setCategoryInput('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const finalCategory = categoryInput.trim();
    if (!finalCategory) return;

    addTransaction({
      amount: Number(amount.replace(/\./g, '')),
      category: finalCategory,
      date,
      note,
      type: 'expense'
    });

    setAmount('');
    setNote('');
    setCategory(currentCategories[0]);
    setCategoryInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-red-50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-red-700">
            <Wallet size={20} />
            Thêm khoản chi
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Số tiền */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Số tiền chi ra
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
                }}
                onBlur={(e) => setAmount(Number(e.target.value.replace(/\./g, '')).toLocaleString('vi-VN'))}
                onFocus={(e) => setAmount(e.target.value.replace(/\./g, ''))}
                className="w-full pl-4 pr-12 py-3 rounded-xl border-2 outline-none text-2xl font-bold placeholder-gray-300 transition-colors border-red-100 focus:border-red-500 text-red-600"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">VNĐ</span>
            </div>
          </div>

          {/* Danh mục & Thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>

              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Nhập danh mục..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />

              {categoryInput.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-xl z-10 max-h-40 overflow-y-auto">
                  {expenseCategories
                    .filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()))
                    .map(c => (
                      <li
                        key={c}
                        onClick={() => {
                          setCategoryInput(c);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                      >
                        {c}
                      </li>
                    ))}

                  {expenseCategories.filter(c =>
                    c.toLowerCase().includes(categoryInput.toLowerCase())
                  ).length === 0 && (
                    <li className="px-4 py-2 text-gray-400 italic">
                      Không có gợi ý
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Thời gian</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú (Tùy chọn)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              placeholder="Vd: Ăn trưa với đồng nghiệp..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 shadow-red-200"
          >
            <Check size={20} />
            Xác nhận chi tiền
          </button>
        </form>
      </div>
    </div>
  );
};
