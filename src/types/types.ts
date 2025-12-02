// Định nghĩa 1 Khoản chi tiêu
export interface Transaction {
  id: string;
  amount: number;       // Số tiền
  category: string;     // Tên danh mục (vd: Ăn uống)
  date: string;         // Ngày (lưu dạng chuỗi ISO)
  note: string;         // Ghi chú
  type: 'expense' | 'income'; // Chi tiêu hoặc Thu nhập
}

// Định nghĩa Ngân sách (Budget)
export interface Budget {
  limit: number;        // Định mức (vd: 5 triệu)
  spent: number;        // Đã chi (tự tính toán)
}

// Định nghĩa dữ liệu cho Biểu đồ
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}