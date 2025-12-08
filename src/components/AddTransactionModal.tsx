import { useState, useMemo, useEffect } from 'react';
import { X, Check, ArrowDownCircle } from 'lucide-react'; // BỎ Wallet
import { useExpenseStore } from '../store/useExpenseStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal = ({ isOpen, onClose }: Props) => {
  const addTransaction = useExpenseStore((state) => state.addTransaction);
  const getAllUniqueCategories = useExpenseStore(state => state.getAllUniqueCategories);
  const addNotification = useExpenseStore(state => state.addNotification);
  // LẤY NGÀY CUỐI CÙNG TỪ STORE
  const lastTransactionDate = useExpenseStore(state => state.lastTransactionDate); 

  const [amount, setAmount] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  // KHỞI TẠO DATE BẰNG NGÀY CUỐI CÙNG
  const [date, setDate] = useState(lastTransactionDate); 
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Dùng useEffect để đồng bộ date khi modal mở
  useEffect(() => {
      if (isOpen) {
          setDate(lastTransactionDate);
      }
  }, [isOpen, lastTransactionDate]);


  // Tính toán danh sách gợi ý động
  const dynamicCategories = useMemo(() => {
    return getAllUniqueCategories();
  }, [getAllUniqueCategories]);


  // Hàm khởi tạo/reset state
  const init = () => {
    setAmount('');
    setCategoryInput('');
    setDate(lastTransactionDate); // Reset về ngày giao dịch cuối cùng
    setNote('');
    setShowSuggestions(false);
  };
  
  // Hàm xử lý khi đóng modal
  const handleClose = () => {
    init();
    onClose();
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const value = amount.replace(/\./g, '');
    const finalAmount = Number(value);
    const finalCategory = categoryInput.trim();

    if (finalAmount <= 0 || !finalCategory) {
        addNotification('Vui lòng nhập số tiền và danh mục hợp lệ!', 'error');
        return;
    }

    addTransaction({
      amount: finalAmount,
      category: finalCategory,
      date,
      note,
      type: 'expense', // CỐ ĐỊNH LÀ 'expense'
    });
    
    addNotification(`Đã thêm khoản chi ${finalAmount.toLocaleString('vi-VN')}đ!`, 'success');
    handleClose(); 
  };
  
  // Logic format tiền tệ khi nhập
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
  };
  
  // Logic hiển thị khi blur/focus
  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '');
    setAmount(Number(raw).toLocaleString('vi-VN'));
  };

  const handleAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setAmount(e.target.value.replace(/\./g, ''));
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header (Chỉ Chi tiêu) */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-red-500 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ArrowDownCircle size={20} /> Thêm khoản Chi tiêu
          </h3>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/20">
            <X size={24} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* SỐ TIỀN */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Số tiền chi ra (VNĐ)</label>
            <input
              type="text"
              required
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              onFocus={handleAmountFocus}
              placeholder="Nhập số tiền..."
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-2xl font-bold placeholder-gray-300 transition-colors border-red-100 focus:border-red-500 text-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* DANH MỤC */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>

              <input
                type="text"
                required
                value={categoryInput}
                onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200); 
                }}
                placeholder="Nhập danh mục..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
              />

              {/* Suggestions */}
              {showSuggestions && categoryInput.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-xl z-10 max-h-40 overflow-y-auto">
                  {dynamicCategories
                    .filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()))
                    .map(c => (
                      <li
                        key={c}
                        onClick={() => {
                          setCategoryInput(c);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-red-50" 
                      >
                        {c}
                      </li>
                    ))}

                  {dynamicCategories.filter(c => 
                    c.toLowerCase().includes(categoryInput.toLowerCase())
                  ).length === 0 && (
                    <li className="px-4 py-2 text-gray-400 italic">
                      Không có gợi ý
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Thời gian */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Thời gian</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none cursor-pointer"
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
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none"
              placeholder="Vd: Ăn trưa với đồng nghiệp..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 shadow-red-200`}
          >
            <Check size={20} /> Xác nhận chi tiền
          </button>
        </form>
      </div>
    </div>
  );
};