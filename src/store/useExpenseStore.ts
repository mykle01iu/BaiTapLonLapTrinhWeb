import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../types/types'; 

interface ExpenseState {
  transactions: Transaction[];
  budgetLimit: number;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  setBudget: (limit: number) => void;
  getTotalExpenses: () => number;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgetLimit: 5000000, 

      addTransaction: (newTransaction) => {
        const transactionWithId = { ...newTransaction, id: uuidv4() };
        
        // 1. Cập nhật State trước
        set((state) => ({
          transactions: [transactionWithId, ...state.transactions],
        }));

        // 2. Logic Kiểm tra Cảnh báo (Đã sửa đổi)
        // Chỉ kiểm tra nếu đây là khoản CHI TIÊU (expense)
        if (newTransaction.type === 'expense') {
          const { transactions, budgetLimit } = get();
          
          // Lấy ngày tháng hiện tại
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // Tính tổng chi tiêu của THÁNG NÀY (Chỉ tính expense)
          const currentMonthSpent = transactions
            .filter(t => {
              const tDate = new Date(t.date);
              return (
                t.type === 'expense' && // Quan trọng: Phải là expense
                tDate.getMonth() === currentMonth &&
                tDate.getFullYear() === currentYear
              );
            })
            .reduce((sum, t) => sum + t.amount, 0);

          // Nếu tổng chi vượt định mức -> Báo động
          if (currentMonthSpent > budgetLimit) {
            alert(`⚠️ Cảnh báo: Bạn đã chi tiêu ${currentMonthSpent.toLocaleString()}đ, vượt quá định mức đề ra tháng này!`);
          }
        }
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      setBudget: (limit) => {
        set({ budgetLimit: limit });
      },

      // Hàm này tính tổng tất cả (dùng cho các mục đích chung nếu cần)
      getTotalExpenses: () => {
        const { transactions } = get();
        return transactions
          .filter(t => t.type === 'expense') // Chỉ cộng expense
          .reduce((sum, item) => sum + item.amount, 0);
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);