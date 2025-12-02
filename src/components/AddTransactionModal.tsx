import { useState, useEffect } from 'react';
import { X, Check, Plus, Minus, Wallet, PiggyBank } from 'lucide-react'; // Thêm icon PiggyBank cho xinh
import { useExpenseStore } from '../store/useExpenseStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal = ({ isOpen, onClose }: Props) => {
  const addTransaction = useExpenseStore((state) => state.addTransaction);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // 1. TÁCH BIỆT DANH SÁCH DANH MỤC
  const expenseCategories = [
    'Ăn uống', 'Di chuyển', 'Thuê nhà', 'Giải trí', 'Mua sắm', 'Y tế', 'Giáo dục', 'Hóa đơn', 'Khác'
  ];
  
  const incomeCategories = [
    'Lương', 'Thưởng', 'Tiền lãi bank', 'Bán hàng', 'Được tặng', 'Hoàn tiền', 'Khác'
  ];

  // Danh sách hiện tại phụ thuộc vào Type
  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  // Khi đổi loại (Thu <-> Chi), tự động reset danh mục về cái đầu tiên của loại đó
  useEffect(() => {
    setCategory(currentCategories[0]);
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addTransaction({
      amount: Number(amount),
      category,
      date,
      note,
      type
    });

    setAmount('');
    setNote('');
    onClose();
  };

  if (!isOpen) return null;

  // Biến màu sắc động (Dynamic Color)
  const themeColor = type === 'expense' ? 'red' : 'green';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header: Đổi màu nền theo loại */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${type === 'expense' ? 'bg-red-50' : 'bg-green-50'}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${type === 'expense' ? 'text-red-700' : 'text-green-700'}`}>
            {type === 'expense' ? <Wallet size={20} /> : <PiggyBank size={20} />}
            {type === 'expense' ? 'Thêm khoản chi' : 'Thêm khoản thu'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Toggle Switch (Nút chuyển đổi xịn hơn) */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex justify-center gap-2 items-center ${
                type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('expense')}
            >
              <Minus size={16} /> Chi tiêu
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex justify-center gap-2 items-center ${
                type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('income')}
            >
              <Plus size={16} /> Thu nhập
            </button>
          </div>

          {/* Nhập số tiền: Đổi màu chữ */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              {type === 'expense' ? 'Số tiền chi ra' : 'Số tiền thực nhận'}
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-4 pr-12 py-3 rounded-xl border-2 outline-none text-2xl font-bold placeholder-gray-300 transition-colors
                  ${type === 'expense' 
                    ? 'border-red-100 focus:border-red-500 text-red-600' 
                    : 'border-green-100 focus:border-green-500 text-green-600'
                  }`}
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">VNĐ</span>
            </div>
          </div>

          {/* Chọn danh mục (Đã lọc) & Ngày */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white cursor-pointer hover:border-blue-400 transition-colors"
              >
                {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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
              placeholder={type === 'expense' ? "Vd: Ăn trưa với đồng nghiệp..." : "Vd: Lương tháng 11..."}
            />
          </div>

          {/* Nút Submit: Đổi màu theo loại */}
          <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2
              ${type === 'expense' 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                : 'bg-green-500 hover:bg-green-600 shadow-green-200'
              }`}
          >
            <Check size={20} />
            {type === 'expense' ? 'Xác nhận chi tiền' : 'Xác nhận thu nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};