import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, CategoryBudget } from '../types/types';

interface ExpenseState {
  transactions: Transaction[];
  budgetLimit: number;
  categoryBudgets: CategoryBudget[]; // Thêm mảng lưu định mức từng danh mục
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  setBudget: (limit: number) => void;
  getTotalExpenses: () => number;
  
  // Thêm các hàm mới
  setCategoryBudgets: (budgets: CategoryBudget[]) => void;
  addCategoryBudget: (category: string, limit: number) => void;
  updateCategoryBudget: (category: string, limit: number) => void;
  removeCategoryBudget: (category: string) => void;
  getCategoryBudget: (category: string) => number;
  getTotalCategoryExpenses: (category: string, month?: number, year?: number) => number;
  getCategoryExpensePercentage: (category: string) => number;
  getOverBudgetCategories: () => Array<{category: string, spent: number, limit: number}>;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgetLimit: 5000000,
      categoryBudgets: [],

      addTransaction: (newTransaction) => {
        const transactionWithId = { ...newTransaction, id: uuidv4() };
        
        // 1. Cập nhật State trước
        set((state) => ({
          transactions: [transactionWithId, ...state.transactions],
        }));

        // 2. Logic Kiểm tra Cảnh báo (Cập nhật)
        if (newTransaction.type === 'expense') {
          const { transactions, budgetLimit, categoryBudgets } = get();
          
          // Lấy ngày tháng hiện tại
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // 2.1 Kiểm tra vượt tổng định mức tháng
          const currentMonthSpent = transactions
            .filter(t => {
              const tDate = new Date(t.date);
              return (
                t.type === 'expense' &&
                tDate.getMonth() === currentMonth &&
                tDate.getFullYear() === currentYear
              );
            })
            .reduce((sum, t) => sum + t.amount, 0);

          if (currentMonthSpent > budgetLimit) {
            alert(`⚠️ Cảnh báo: Bạn đã chi tiêu ${currentMonthSpent.toLocaleString()}đ, vượt quá tổng định mức tháng này!`);
          }

          // 2.2 Kiểm tra vượt định mức từng danh mục
          const categoryBudget = categoryBudgets.find(cb => cb.category === newTransaction.category);
          if (categoryBudget) {
            const categorySpentThisMonth = transactions
              .filter(t => {
                const tDate = new Date(t.date);
                return (
                  t.type === 'expense' &&
                  t.category === newTransaction.category &&
                  tDate.getMonth() === currentMonth &&
                  tDate.getFullYear() === currentYear
                );
              })
              .reduce((sum, t) => sum + t.amount, 0);

            if (categorySpentThisMonth > categoryBudget.limit) {
              alert(`⚠️ Cảnh báo: Bạn đã vượt định mức cho danh mục "${newTransaction.category}"! (${categorySpentThisMonth.toLocaleString()}đ / ${categoryBudget.limit.toLocaleString()}đ)`);
            }
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

      getTotalExpenses: () => {
        const { transactions } = get();
        return transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, item) => sum + item.amount, 0);
      },

      // Thêm/sửa/xóa định mức danh mục
      setCategoryBudgets: (budgets) => {
        set({ categoryBudgets: budgets });
      },

      addCategoryBudget: (category, limit) => {
        set((state) => ({
          categoryBudgets: [...state.categoryBudgets, { category, limit }]
        }));
      },

      updateCategoryBudget: (category, limit) => {
        set((state) => ({
          categoryBudgets: state.categoryBudgets.map(cb => 
            cb.category === category ? { ...cb, limit } : cb
          )
        }));
      },

      removeCategoryBudget: (category) => {
        set((state) => ({
          categoryBudgets: state.categoryBudgets.filter(cb => cb.category !== category)
        }));
      },

      // Lấy định mức của danh mục
      getCategoryBudget: (category) => {
        const { categoryBudgets } = get();
        const budget = categoryBudgets.find(cb => cb.category === category);
        return budget ? budget.limit : 0;
      },

      // Lấy tổng chi của danh mục trong tháng
      getTotalCategoryExpenses: (category, month, year) => {
        const { transactions } = get();
        const now = new Date();
        const targetMonth = month !== undefined ? month : now.getMonth();
        const targetYear = year !== undefined ? year : now.getFullYear();

        return transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return (
              t.type === 'expense' &&
              t.category === category &&
              tDate.getMonth() === targetMonth &&
              tDate.getFullYear() === targetYear
            );
          })
          .reduce((sum, t) => sum + t.amount, 0);
      },

      // Lấy phần trăm đã chi của danh mục
      getCategoryExpensePercentage: (category) => {
        const limit = get().getCategoryBudget(category);
        if (limit === 0) return 0;
        
        const spent = get().getTotalCategoryExpenses(category);
        return (spent / limit) * 100;
      },

      // Lấy danh sách danh mục vượt định mức
      getOverBudgetCategories: () => {
        const { categoryBudgets } = get();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return categoryBudgets
          .map(budget => {
            const spent = get().getTotalCategoryExpenses(budget.category, currentMonth, currentYear);
            return {
              category: budget.category,
              spent,
              limit: budget.limit
            };
          })
          .filter(item => item.spent > item.limit);
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);