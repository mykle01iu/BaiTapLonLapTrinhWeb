import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, CategoryBudget } from '../types/types';

interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'success';
}

interface ExpenseState {
  transactions: Transaction[];
  budgetLimit: number;
  categoryBudgets: CategoryBudget[];
  notifications: Notification[];
  lastTransactionDate: string; // THÊM STATE: Lưu ngày cuối cùng nhập
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  
  getTotalExpenses: () => number;
  getTotalCategoryLimit: () => number; 
  
  setCategoryBudgets: (budgets: CategoryBudget[]) => void;
  addCategoryBudget: (category: string, limit: number) => void;
  updateCategoryBudget: (category: string, limit: number) => void;
  removeCategoryBudget: (category: string) => void;
  getCategoryBudget: (category: string) => number;
  getTotalCategoryExpenses: (category: string, month?: number, year?: number) => number;
  getCategoryExpensePercentage: (category: string) => number;
  getOverBudgetCategories: () => Array<{category: string, spent: number, limit: number}>;
  getAllUniqueCategories: () => string[];

  addNotification: (message: string, type: 'warning' | 'error' | 'success') => void;
  removeNotification: (id: string) => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgetLimit: 5000000, 
      categoryBudgets: [],
      notifications: [],
      lastTransactionDate: new Date().toISOString().split('T')[0], // KHỞI TẠO STATE MỚI

      // --- ACTIONS CHO NOTIFICATION ---
      addNotification: (message, type) => {
          const newNotification: Notification = { id: uuidv4(), message, type };
          set((state) => ({
              notifications: [...state.notifications, newNotification],
          }));
          setTimeout(() => {
              get().removeNotification(newNotification.id);
          }, 5000);
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      // --- ACTIONS GIAO DỊCH ---
      addTransaction: (newTransaction) => {
        const transactionWithId = { ...newTransaction, id: uuidv4(), type: 'expense' as const };
        
        set((state) => ({
          transactions: [transactionWithId, ...state.transactions],
          lastTransactionDate: newTransaction.date, // LƯU NGÀY GIAO DỊCH CUỐI CÙNG
        }));

        const totalLimit = get().getTotalCategoryLimit();
        const { categoryBudgets } = get();
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const currentMonthSpent = get().transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return (
              t.type === 'expense' &&
              tDate.getMonth() === currentMonth &&
              tDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, t) => sum + t.amount, newTransaction.amount);

        if (currentMonthSpent > totalLimit && totalLimit > 0) {
          get().addNotification(
              `Bạn đã chi tiêu ${currentMonthSpent.toLocaleString()}đ, vượt quá TỔNG định mức tháng này!`,
              'error'
          );
        }

        const categoryBudget = categoryBudgets.find(cb => cb.category === newTransaction.category);
        if (categoryBudget) {
          const categorySpentAfterAdd = get().getTotalCategoryExpenses(newTransaction.category, currentMonth, currentYear);
          
          if (categorySpentAfterAdd > categoryBudget.limit) {
            get().addNotification(
              `Đã vượt định mức cho danh mục "${newTransaction.category}"! (${categorySpentAfterAdd.toLocaleString()}đ / ${categoryBudget.limit.toLocaleString()}đ)`,
              'warning'
            );
          }
        }
      },

      removeTransaction: (id) => {
        const { transactions } = get();
        const transactionToRemove = transactions.find(t => t.id === id);
        
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        
        if (transactionToRemove) {
             get().addNotification(
                 `Đã xóa giao dịch "${transactionToRemove.category}" thành công.`,
                 'success'
             );
        }
      },
      
      // ... (actions định mức danh mục giữ nguyên) ...

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
        get().addNotification(
            `Đã xóa định mức cho danh mục "${category}" thành công.`,
            'success'
        );
      },
      
      // --- SELECTORS / HÀM TÍNH TOÁN ---

      getTotalCategoryLimit: () => {
          return get().categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0);
      },
      
      getTotalExpenses: () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return get().transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return (
              t.type === 'expense' &&
              tDate.getMonth() === currentMonth &&
              tDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, item) => sum + item.amount, 0);
      },

      getCategoryBudget: (category) => {
        const { categoryBudgets } = get();
        const budget = categoryBudgets.find(cb => cb.category === category);
        return budget ? budget.limit : 0;
      },

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

      getCategoryExpensePercentage: (category) => {
        const limit = get().getCategoryBudget(category);
        if (limit === 0) return 0;
        
        const spent = get().getTotalCategoryExpenses(category);
        return (spent / limit) * 100;
      },

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
      
      getAllUniqueCategories: () => {
          const { transactions, categoryBudgets } = get();
          
          const transactionCategories = transactions
              .filter(t => t.type === 'expense')
              .map(t => t.category);

          const budgetCategories = categoryBudgets.map(cb => cb.category);
          
          const allCategories = [...transactionCategories, ...budgetCategories];
          const uniqueCategories = Array.from(new Set(allCategories));

          return uniqueCategories.sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);