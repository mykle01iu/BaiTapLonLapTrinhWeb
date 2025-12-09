import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useExpenseStore } from '../store/useExpenseStore';
import { LineChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useMemo } from 'react';

const Reports = () => {
    const {
        transactions,
        getTotalCategoryLimit,
        categoryBudgets,
        getTotalMonthlyExpenses,
        getTotalCategoryExpenses, // DÙNG HÀM NÀY ĐỂ TÍNH TOÁN DANH MỤC
        getAvailableReportPeriods
    } = useExpenseStore();

    const availablePeriods = getAvailableReportPeriods();

    // TÍNH TOÁN THÁNG/NĂM HIỂN THỊ MẶC ĐỊNH
    const today = new Date();
    const initialPeriod = availablePeriods.length > 0 ? availablePeriods[0] :
        { month: today.getMonth(), year: today.getFullYear() };

    const [selectedMonth, setSelectedMonth] = useState(initialPeriod.month);
    const [selectedYear, setSelectedYear] = useState(initialPeriod.year);

    // Nếu dữ liệu giao dịch mới hơn tháng đang hiển thị, tự động chuyển sang tháng mới nhất
    useState(() => {
        if (availablePeriods.length > 0) {
            const latestPeriod = availablePeriods[0];
            if (latestPeriod.year > selectedYear ||
                (latestPeriod.year === selectedYear && latestPeriod.month > selectedMonth)) {
                setSelectedMonth(latestPeriod.month);
                setSelectedYear(latestPeriod.year);
            }
        }
    });

    const totalLimit = getTotalCategoryLimit();

    // Tính toán so sánh tháng trước
    const currentMonthSpent = getTotalMonthlyExpenses(selectedMonth, selectedYear);

    const lastMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthSpent = getTotalMonthlyExpenses(lastMonth, lastMonthYear);

    const difference = currentMonthSpent - lastMonthSpent;
    const percentageChange = lastMonthSpent > 0 ? (difference / lastMonthSpent) * 100 : 0;

    let trendIcon;
    let trendClass;
    if (difference > 0) {
        trendIcon = <TrendingUp size={24} />;
        trendClass = 'text-red-500 bg-red-50';
    } else if (difference < 0) {
        trendIcon = <TrendingDown size={24} />;
        trendClass = 'text-green-500 bg-green-50';
    } else {
        trendIcon = <Minus size={24} />;
        trendClass = 'text-gray-500 bg-gray-50';
    }

    // Dữ liệu hàng tháng (chỉ lấy các tháng trong năm được chọn)
    const monthlyData = useMemo(() => {
        const data = Array.from({ length: 12 }, (_, i) => {
            const monthIndex = i;
            const totalSpentInMonth = getTotalMonthlyExpenses(monthIndex, selectedYear);

            // Chỉ hiển thị dữ liệu nếu đã có chi tiêu hoặc đã đặt định mức
            if (totalSpentInMonth === 0 && totalLimit === 0) return null;

            return {
                name: `T${monthIndex + 1}`,
                "Đã chi": totalSpentInMonth,
                "Định mức": totalLimit,
                "Vượt mức": Math.max(0, totalSpentInMonth - totalLimit)
            };
        }).filter(d => d !== null);

        // Lọc để chỉ hiển thị các tháng đã qua hoặc tháng hiện tại
        return data.filter(d => {
            const monthIndex = Number(d?.name.replace('T', '')) - 1;
            return selectedYear < today.getFullYear() ||
                (selectedYear === today.getFullYear() && monthIndex <= today.getMonth());
        });
    }, [totalLimit, getTotalMonthlyExpenses, selectedYear, today]);


    // Dữ liệu định mức theo danh mục (cho tháng được chọn)
    const categoryBudgetData = useMemo(() => {
        return categoryBudgets.map(budget => {
            // SỬA LỖI: Dùng getTotalCategoryExpenses thay vì getTotalMonthlyExpenses
            const spent = getTotalCategoryExpenses(budget.category, selectedMonth, selectedYear);
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            return {
                name: budget.category,
                "Định mức": budget.limit,
                "Đã chi": spent,
                "Phần trăm": percentage
            };
        }).filter(d => d["Đã chi"] > 0 || d["Định mức"] > 0);
    }, [categoryBudgets, getTotalCategoryExpenses, selectedMonth, selectedYear]);


    const getBarColor = (percentage: number) => {
        if (percentage > 100) return '#ef4444';
        if (percentage > 80) return '#f59e0b';
        return '#3b82f6';
    };

    if (totalLimit === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[300px] flex flex-col items-center justify-center text-gray-500">
                <h2 className="text-xl font-bold mb-3">Chưa có dữ liệu báo cáo</h2>
                <p>Vui lòng vào mục <span className="font-semibold text-blue-600">Cấu hình</span> để thiết lập Định mức Danh mục.</p>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Báo cáo thống kê</h2>
                    <p className="text-gray-500 text-sm">Tình hình chi tiêu qua các tháng trong năm</p>
                </div>
            </div>

            {/* BỘ CHỌN THÁNG/NĂM */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <span className="font-medium text-gray-700">Xem Báo cáo của Tháng:</span>
                <select
                    value={`${selectedMonth}-${selectedYear}`}
                    onChange={(e) => {
                        const [month, year] = e.target.value.split('-').map(Number);
                        setSelectedMonth(month);
                        setSelectedYear(year);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none cursor-pointer"
                >
                    {availablePeriods.map(p => (
                        <option
                            key={`${p.month}-${p.year}`}
                            value={`${p.month}-${p.year}`}
                        >
                            Tháng {p.month + 1}/{p.year}
                        </option>
                    ))}
                    {/* Thêm tháng hiện tại nếu chưa có giao dịch */}
                    {availablePeriods.length === 0 && (
                        <option value={`${initialPeriod.month}-${initialPeriod.year}`}>
                            Tháng {initialPeriod.month + 1}/{initialPeriod.year} (Tháng hiện tại)
                        </option>
                    )}
                </select>
            </div>

            {/* PHÂN TÍCH SO SÁNH THÁNG */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-700 mb-4">
                    So sánh Chi tiêu (T{selectedMonth + 1}/{selectedYear} vs T{lastMonth + 1}/{lastMonthYear})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Tháng trước */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Chi tháng {lastMonth + 1}</div>
                        <div className="text-xl font-bold text-gray-800">{lastMonthSpent.toLocaleString()}đ</div>
                    </div>

                    {/* Tháng hiện tại */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-600">Chi tháng {selectedMonth + 1}</div>
                        <div className="text-2xl font-bold text-blue-800">{currentMonthSpent.toLocaleString()}đ</div>
                    </div>

                    {/* Mức chênh lệch */}
                    <div className={`p-3 rounded-lg ${trendClass}`}>
                        <div className="text-sm font-medium">Chênh lệch</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {trendIcon}
                            {difference.toLocaleString()}đ
                        </div>
                    </div>

                    {/* % Thay đổi */}
                    <div className={`p-3 rounded-lg ${trendClass}`}>
                        <div className="text-sm font-medium">Thay đổi</div>
                        <div className="text-2xl font-bold">
                            {percentageChange.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>


            {/* Biểu đồ cột tổng quan (Sử dụng dữ liệu theo selectedYear) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <LineChart size={20} className="text-gray-400" /> Xu hướng Chi tiêu Năm {selectedYear} vs Định mức Tổng ({totalLimit.toLocaleString()} đ)
                </h3>

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

            {/* Biểu đồ định mức theo danh mục (Sử dụng dữ liệu theo selectedMonth/Year) */}
            {categoryBudgets.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-6">
                        Định mức theo danh mục (Tháng {selectedMonth + 1}/{selectedYear})
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Biểu đồ cột */}
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={categoryBudgetData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={100}
                                        tick={{ fontSize: 12 }}
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
                    Chi tiết theo năm {selectedYear}
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
                            <div className="col-span-2 font-medium text-gray-800">{item?.name}</div>
                            <div className="col-span-4 text-right font-bold text-blue-600">
                                {item?.["Đã chi"].toLocaleString('vi-VN')} đ
                            </div>
                            <div className="col-span-4 text-right text-gray-400">
                                {item?.["Định mức"].toLocaleString('vi-VN')} đ
                            </div>
                            <div className="col-span-2 text-right">
                                {item && item["Đã chi"] > item["Định mức"] ? (
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