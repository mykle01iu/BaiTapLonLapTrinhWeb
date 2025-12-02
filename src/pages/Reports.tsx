import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenseStore } from '../store/useExpenseStore';

const Reports = () => {
    const { transactions, budgetLimit } = useExpenseStore();

    // Logic xử lý dữ liệu: Tạo mảng 12 tháng
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i; // 0 = Tháng 1, 11 = Tháng 12

        // Lọc các giao dịch trong tháng i
        const totalSpentInMonth = transactions
            .filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === monthIndex && t.type === 'expense';
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            name: `T${i + 1}`, // Tên hiển thị trục hoành: T1, T2...
            "Đã chi": totalSpentInMonth,
            "Định mức": budgetLimit,
            "Vượt mức": Math.max(0, totalSpentInMonth - budgetLimit) // Tính phần dôi ra nếu có
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Báo cáo thống kê</h2>
                    <p className="text-gray-500 text-sm">Tình hình chi tiêu qua các tháng trong năm</p>
                </div>
            </div>

            {/* Biểu đồ cột */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                <h3 className="text-lg font-bold text-gray-700 mb-6">So sánh Chi tiêu thực tế vs Định mức</h3>

                <ResponsiveContainer width="100%" height="85%">
                    <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value / 1000}k`} /> {/* Rút gọn số tiền cho đỡ rối */}
                        <Tooltip
                            formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />

                        {/* Cột Định mức (Màu xám nhạt làm nền) */}
                        <Bar dataKey="Định mức" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Định mức (Limit)" />

                        {/* Cột Đã chi (Màu xanh chủ đạo) */}
                        <Bar dataKey="Đã chi" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Thực chi (Spent)" />

                        {/* Cột Vượt mức (Màu đỏ cảnh báo - Stack lên trên nếu muốn, ở đây để riêng cho rõ) */}
                        {/* Nếu muốn hiện cột cảnh báo riêng thì uncomment dòng dưới */}
                        {/* <Bar dataKey="Vượt mức" fill="#ef4444" radius={[4, 4, 0, 0]} /> */}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bảng chi tiết (Phụ) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
                    Chi tiết theo tháng
                </div>
                <div className="grid grid-cols-12 gap-4 p-4 text-sm text-gray-500 border-b bg-gray-50">
                    <div className="col-span-2 font-semibold">Tháng</div>
                    <div className="col-span-4 font-semibold text-right">Thực chi</div>
                    <div className="col-span-4 font-semibold text-right">Định mức</div>
                    <div className="col-span-2 font-semibold text-right">Trạng thái</div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                    {monthlyData.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 hover:bg-gray-50 items-center">
                            <div className="col-span-2 font-medium text-gray-800">Tháng {index + 1}</div>
                            <div className="col-span-4 text-right font-bold text-blue-600">
                                {item["Đã chi"].toLocaleString('vi-VN')} đ
                            </div>
                            <div className="col-span-4 text-right text-gray-400">
                                {item["Định mức"].toLocaleString('vi-VN')} đ
                            </div>
                            <div className="col-span-2 text-right">
                                {item["Đã chi"] > item["Định mức"] ? (
                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Vượt mức</span>
                                ) : (
                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">An toàn</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;