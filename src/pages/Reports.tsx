import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useExpenseStore } from '../store/useExpenseStore';

const Reports = () => {
    const { transactions, budgetLimit, categoryBudgets } = useExpenseStore();

    // Logic xử lý dữ liệu: Tạo mảng 12 tháng
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i;

        // Lọc các giao dịch trong tháng i
        const totalSpentInMonth = transactions
            .filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === monthIndex && t.type === 'expense';
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            name: `T${i + 1}`,
            "Đã chi": totalSpentInMonth,
            "Định mức": budgetLimit,
            "Vượt mức": Math.max(0, totalSpentInMonth - budgetLimit)
        };
    });

    // Tính dữ liệu cho biểu đồ định mức danh mục
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const categoryBudgetData = categoryBudgets.map(budget => {
        const spent = transactions
            .filter(t => {
                const date = new Date(t.date);
                return (
                    t.type === 'expense' &&
                    t.category === budget.category &&
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear
                );
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
        
        return {
            name: budget.category,
            "Định mức": budget.limit,
            "Đã chi": spent,
            "Phần trăm": percentage
        };
    });

    // Màu sắc cho biểu đồ
    const getBarColor = (percentage: number) => {
        if (percentage > 100) return '#ef4444'; // Đỏ
        if (percentage > 80) return '#f59e0b'; // Vàng
        return '#10b981'; // Xanh
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Báo cáo thống kê</h2>
                    <p className="text-gray-500 text-sm">Tình hình chi tiêu qua các tháng trong năm</p>
                </div>
            </div>

            {/* Biểu đồ cột tổng quan */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                <h3 className="text-lg font-bold text-gray-700 mb-6">So sánh Chi tiêu thực tế vs Định mức</h3>

                <ResponsiveContainer width="100%" height="85%">
                    <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip
                            formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="Định mức" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Định mức (Limit)" />
                        <Bar dataKey="Đã chi" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Thực chi (Spent)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ định mức theo danh mục (Tháng hiện tại) */}
            {categoryBudgets.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-6">
                        Định mức theo danh mục (Tháng {currentMonth + 1}/{currentYear})
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Biểu đồ cột */}
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={categoryBudgetData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                                            name
                                        ]}
                                    />
                                    <Bar 
                                        dataKey="Đã chi" 
                                        name="Đã chi"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {categoryBudgetData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={getBarColor(entry["Phần trăm"])}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Danh sách chi tiết */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-700">Chi tiết định mức</h4>
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                {categoryBudgetData.map((item, index) => {
                                    const isOver = item["Đã chi"] > item["Định mức"];
                                    const percentage = item["Phần trăm"];
                                    
                                    return (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-medium text-gray-800">{item.name}</div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-gray-600'}`}>
                                                        {percentage.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-sm text-gray-500 mb-2">
                                                <div>Định mức: <span className="font-bold">{item["Định mức"].toLocaleString()}đ</span></div>
                                                <div>Đã chi: <span className={`font-bold ${isOver ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {item["Đã chi"].toLocaleString()}đ
                                                </span></div>
                                            </div>
                                            
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full transition-all duration-500"
                                                    style={{ 
                                                        width: `${Math.min(percentage, 100)}%`,
                                                        backgroundColor: getBarColor(percentage)
                                                    }}
                                                />
                                            </div>
                                            
                                            {isOver && (
                                                <div className="mt-2 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                                                    ⚠️ Vượt {Math.abs(item["Định mức"] - item["Đã chi"]).toLocaleString()}đ
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bảng chi tiết theo tháng */}
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