import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, PieChart as PieIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ReportsTabProps {
  userId: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export function ReportsTab({ userId }: ReportsTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [chartData, setChartData] = useState<any>({
    daily: [],
    category: [],
    trend: []
  });

  useEffect(() => {
    loadData();
  }, [userId, period]);

  const loadData = () => {
    const txs = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
    const cats = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    
    setTransactions(txs);
    setCategories(cats);
    
    calculateChartData(txs, cats);
  };

  const calculateChartData = (txs: any[], cats: any[]) => {
    // Daily income/expense data
    const dailyData: any = {};
    const now = new Date();
    const daysToShow = period === 'week' ? 7 : period === 'month' ? 30 : 365;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }

    txs.forEach((tx: any) => {
      if (dailyData[tx.date]) {
        if (tx.type === 'income') {
          dailyData[tx.date].income += tx.amount;
        } else {
          dailyData[tx.date].expense += tx.amount;
        }
      }
    });

    const dailyArray = Object.values(dailyData).map((day: any) => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }));

    // Category data
    const categoryTotals: any = {};
    const expenseTxs = txs.filter((t: any) => t.type === 'expense');
    
    expenseTxs.forEach((tx: any) => {
      if (!categoryTotals[tx.categoryId]) {
        categoryTotals[tx.categoryId] = 0;
      }
      categoryTotals[tx.categoryId] += tx.amount;
    });

    const categoryData = Object.entries(categoryTotals)
      .map(([catId, amount]) => {
        const cat = cats.find((c: any) => c.id === catId);
        return {
          name: cat?.name || 'Khác',
          value: amount as number,
          percentage: 0
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);
    categoryData.forEach((item) => {
      item.percentage = ((item.value / totalExpense) * 100).toFixed(1);
    });

    // Trend data (monthly for year view)
    const trendData: any[] = [];
    if (period === 'year') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const monthTxs = txs.filter((tx: any) => tx.date.startsWith(monthStr));
        const income = monthTxs
          .filter((tx: any) => tx.type === 'income')
          .reduce((sum: number, tx: any) => sum + tx.amount, 0);
        const expense = monthTxs
          .filter((tx: any) => tx.type === 'expense')
          .reduce((sum: number, tx: any) => sum + tx.amount, 0);
        
        trendData.push({
          month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
          income,
          expense,
          balance: income - expense
        });
      }
    }

    setChartData({
      daily: dailyArray,
      category: categoryData,
      trend: trendData
    });
  };

  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-800 dark:text-white">Báo cáo & Thống kê</h2>
          <p className="text-gray-600 dark:text-gray-400">Phân tích chi tiết tài chính của bạn</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                period === p
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {p === 'week' ? '7 ngày' : p === 'month' ? '30 ngày' : 'Năm'}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="time" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
          <TabsTrigger value="time">Thu chi theo thời gian</TabsTrigger>
          <TabsTrigger value="category">Phân bổ chi tiêu</TabsTrigger>
          <TabsTrigger value="top">Top danh mục</TabsTrigger>
          <TabsTrigger value="overview">Tổng quan tài chính</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-800 dark:text-white mb-4">Biểu đồ thu chi</h3>
            <ResponsiveContainer width="100%" height={400}>
              {period === 'year' ? (
                <LineChart data={chartData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px' }}
                    formatter={(value: any) => value.toLocaleString('vi-VN') + '₫'}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Thu" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Chi" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} name="Số dư" dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={chartData.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px' }}
                    formatter={(value: any) => value.toLocaleString('vi-VN') + '₫'}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Thu" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" name="Chi" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-800 dark:text-white mb-4">Phân bổ chi tiêu theo danh mục</h3>
            {chartData.category.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData.category}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.percentage}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.category.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => value.toLocaleString('vi-VN') + '₫'} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                Chưa có dữ liệu chi tiêu
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-800 dark:text-white mb-4">Top danh mục chi tiêu nhiều nhất</h3>
            <div className="space-y-4">
              {chartData.category.length > 0 ? (
                chartData.category.map((cat: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {cat.value.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">Tổng thu</span>
              </div>
              <p className="text-green-600 text-xl font-bold">{totalIncome.toLocaleString('vi-VN')}₫</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-gray-600 dark:text-gray-400">Tổng chi</span>
              </div>
              <p className="text-red-600 text-xl font-bold">{totalExpense.toLocaleString('vi-VN')}₫</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="text-gray-600 dark:text-gray-400">Số dư</span>
              </div>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {balance.toLocaleString('vi-VN')}₫
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <PieIcon className="w-5 h-5 text-purple-600" />
                <span className="text-gray-600 dark:text-gray-400">Tỷ lệ tiết kiệm</span>
              </div>
              <p className="text-purple-600 text-xl font-bold">{savingsRate}%</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-800 dark:text-white mb-4">Chỉ số tài chính</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Chi tiêu trung bình mỗi ngày</p>
                <p className="text-gray-800 dark:text-white font-semibold">
                  {(totalExpense / (period === 'week' ? 7 : period === 'month' ? 30 : 365)).toLocaleString('vi-VN', {
                    maximumFractionDigits: 0
                  })}₫
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Tổng số giao dịch</p>
                <p className="text-gray-800 dark:text-white font-semibold">{transactions.length} giao dịch</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Giao dịch chi lớn nhất</p>
                <p className="text-gray-800 dark:text-white font-semibold">
                  {Math.max(
                    ...transactions.filter((t: any) => t.type === 'expense').map((t: any) => t.amount),
                    0
                  ).toLocaleString('vi-VN')}₫
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Giao dịch thu lớn nhất</p>
                <p className="text-gray-800 dark:text-white font-semibold">
                  {Math.max(
                    ...transactions.filter((t: any) => t.type === 'income').map((t: any) => t.amount),
                    0
                  ).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}