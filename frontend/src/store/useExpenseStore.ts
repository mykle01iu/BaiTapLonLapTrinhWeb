// src/store/useExpenseStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, CategoryBudget, AuthState, UserInfo } from '../types/types'; 

interface Notification {
    id: string;
    message: string;
    type: 'warning' | 'error' | 'success';
}

interface ExpenseState {
    token: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;
    
    transactions: Transaction[];
    categoryBudgets: CategoryBudget[];
    
    notifications: Notification[];
    lastTransactionDate: string; 

    // ===== CẬP NHẬT: Login giờ gọi API thật =====
    login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;

    addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    removeTransaction: (id: string) => void;
    
    getTotalExpenses: () => number;
    getTotalCategoryLimit: () => number; 
    
    setCategoryBudgets: (budgets: CategoryBudget[]) => void;
    addCategoryBudget: (category: string, limit: number) => void;
    updateCategoryBudget: (category: string, limit: number) => void;
    removeCategoryBudget: (category: string) => void;
    
    getTotalMonthlyExpenses: (month: number, year: number) => number; 
    getAvailableReportPeriods: () => Array<{month: number, year: number}>;

    getCategoryBudget: (category: string) => number;
    getTotalCategoryExpenses: (category: string, month?: number, year?: number) => number;
    getCategoryExpensePercentage: (category: string) => number;
    getOverBudgetCategories: () => Array<{category: string, spent: number, limit: number}>;
    getAllUniqueCategories: () => string[];

    addNotification: (message: string, type: 'warning' | 'error' | 'success') => void;
    removeNotification: (id: string) => void;
}

// Hàm khởi tạo Auth state mặc định
const initialAuthState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

// Hàm khởi tạo Data state mặc định
const initialDataState = {
    transactions: [],
    categoryBudgets: [],
    lastTransactionDate: new Date().toISOString().split('T')[0],
};


export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      // === STATE ===
      ...initialAuthState,
      ...initialDataState,
      notifications: [],
      
      // ===== CẬP NHẬT: LOGIN GỌI API THẬT =====
      login: async (username: string, password: string) => {
          try {
              const { authAPI, transactionAPI, budgetAPI } = await import('../services/api');
              
              // Gọi API login
              const data = await authAPI.login(username, password);
              
              if (data.success && data.token && data.user) {
                  set({ 
                      token: data.token, 
                      user: data.user, 
                      isAuthenticated: true 
                  });
                  
                  // Load dữ liệu từ server
                  try {
                      const [transactionsData, budgetsData] = await Promise.all([
                          transactionAPI.getAll(),
                          budgetAPI.getAll()
                      ]);
                      
                      if (transactionsData.success) {
                          set({ transactions: transactionsData.transactions });
                      }
                      
                      if (budgetsData.success) {
                          set({ categoryBudgets: budgetsData.budgets });
                      }
                  } catch (loadError) {
                      console.error('Load data error:', loadError);
                  }
                  
                  get().addNotification(`Chào mừng, ${data.user.username}!`, 'success');
                  return { success: true };
              }
              
              return { success: false, message: 'Login failed' };
          } catch (error: any) {
              get().addNotification(error.message || 'Đăng nhập thất bại!', 'error');
              return { success: false, message: error.message };
          }
      },
      
      // ===== CẬP NHẬT: LOGOUT XÓA TOKEN =====
      logout: async () => {
          try {
              const { authAPI } = await import('../services/api');
              authAPI.logout(); // Xóa token khỏi localStorage
          } catch (error) {
              console.error('Logout error:', error);
          }
          
          set(initialAuthState);
          set(initialDataState);
          get().addNotification('Đã đăng xuất thành công.', 'success');
      },

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

      addTransaction: (newTransaction) => {
        const transactionWithId = { ...newTransaction, id: uuidv4(), type: 'expense' as const };
        
        set((state) => ({
          transactions: [transactionWithId, ...state.transactions],
          lastTransactionDate: newTransaction.date,
        }));
        
        const totalLimit = get().getTotalCategoryLimit();
        const { categoryBudgets } = get();
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const currentMonthSpent = get().getTotalMonthlyExpenses(currentMonth, currentYear);

        if (currentMonthSpent + newTransaction.amount > totalLimit && totalLimit > 0) {
          get().addNotification(
              `Bạn đã chi tiêu ${(currentMonthSpent + newTransaction.amount).toLocaleString()}đ, vượt quá TỔNG định mức tháng này!`,
              'error'
          );
        }

        const categoryBudget = categoryBudgets.find(cb => cb.category === newTransaction.category);
        if (categoryBudget) {
          const categorySpentAfterAdd = get().getTotalCategoryExpenses(newTransaction.category, currentMonth, currentYear);
          
          if (categorySpentAfterAdd + newTransaction.amount > categoryBudget.limit) {
            get().addNotification(
              `Đã vượt định mức cho danh mục "${newTransaction.category}"! (${(categorySpentAfterAdd + newTransaction.amount).toLocaleString()}đ / ${categoryBudget.limit.toLocaleString()}đ)`,
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
      
      getTotalMonthlyExpenses: (month: number, year: number) => {
        return get().transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return (
              t.type === 'expense' &&
              tDate.getMonth() === month &&
              tDate.getFullYear() === year
            );
          })
          .reduce((sum, item) => sum + item.amount, 0);
      },
      
      getTotalExpenses: () => {
        const now = new Date();
        return get().getTotalMonthlyExpenses(now.getMonth(), now.getFullYear());
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
      
      getAvailableReportPeriods: () => {
          const periods = get().transactions
              .filter(t => t.type === 'expense')
              .map(t => {
                  const date = new Date(t.date);
                  return {
                      month: date.getMonth(),
                      year: date.getFullYear()
                  };
              });

          const uniquePeriods = periods.reduce((acc, current) => {
              const key = `${current.year}-${current.month}`;
              if (!acc.find(p => p.key === key)) {
                  acc.push({ key, month: current.month, year: current.year });
              }
              return acc;
          }, [] as Array<{key: string, month: number, year: number,}>);

          return uniquePeriods
              .sort((a, b) => {
                  if (b.year !== a.year) return b.year - a.year;
                  return b.month - a.month;
              })
              .map(p => ({ month: p.month, year: p.year }));
      },
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => localStorage),
      // CHỈ LƯU TRỮ DỮ LIỆU CHÍNH, KHÔNG LƯU TOKEN VÀ AUTH STATE TRONG PERSIST
      partialize: (state) => ({ 
          transactions: state.transactions,
          categoryBudgets: state.categoryBudgets,
          lastTransactionDate: state.lastTransactionDate,
      })
    }
  )
);