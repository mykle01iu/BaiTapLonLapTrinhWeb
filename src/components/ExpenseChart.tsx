import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useExpenseStore } from '../store/useExpenseStore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BF9', '#F27598'];

export const ExpenseChart = () => {
  const { transactions } = useExpenseStore();

  // --- LOGIC MỚI: Chỉ lấy dữ liệu THÁNG HIỆN TẠI ---
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 = Tháng 1
  const currentYear = now.getFullYear();

  const dataMap = transactions
    .filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === 'expense' && // Chỉ lấy khoản Chi
        tDate.getMonth() === currentMonth && // Đúng tháng này
        tDate.getFullYear() === currentYear // Đúng năm này
      );
    })
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  // Nếu tháng này chưa tiêu gì thì hiện thông báo
  if (dataMap.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[300px] flex flex-col items-center justify-center text-gray-400 text-sm">
        <p>Tháng {currentMonth + 1} chưa có chi tiêu nào.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <h3 className="text-gray-800 font-bold mb-4">Phân bổ chi tiêu (Tháng {currentMonth + 1})</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataMap}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {dataMap.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toLocaleString()} đ`} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};