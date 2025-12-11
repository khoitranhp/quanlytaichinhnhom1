import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OverviewTabProps {
  userId: string;
  onStatsUpdate: () => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString('vi-VN')}₫
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function OverviewTab({ userId, onStatsUpdate }: OverviewTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const txs = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
    const budgetsData = JSON.parse(localStorage.getItem(`budgets_${userId}`) || '[]');
    const cats = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    const goalsData = JSON.parse(localStorage.getItem(`goals_${userId}`) || '[]');

    setTransactions(txs);
    setBudgets(budgetsData);
    setCategories(cats);
    setGoals(goalsData);

    // Calculate monthly data for chart
    calculateMonthlyData(txs);
    calculateCategoryData(txs, cats);
  };

  const calculateMonthlyData = (txs: any[]) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTxs = txs.filter((t: any) => t.date === dateStr);
      const income = dayTxs
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      const expense = dayTxs
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      last7Days.push({
        date: date.getDate() + '/' + (date.getMonth() + 1),
        income,
        expense
      });
    }
    setMonthlyData(last7Days);
  };

  const calculateCategoryData = (txs: any[], cats: any[]) => {
    const expenseTxs = txs.filter((t: any) => t.type === 'expense');
    const categoryTotals: any = {};

    expenseTxs.forEach((tx: any) => {
      if (!categoryTotals[tx.categoryId]) {
        categoryTotals[tx.categoryId] = 0;
      }
      categoryTotals[tx.categoryId] += tx.amount;
    });

    const data = Object.entries(categoryTotals).map(([catId, amount]) => {
      const cat = cats.find((c: any) => c.id === catId);
      return {
        name: cat?.name || 'Khác',
        value: amount as number
      };
    });

    setCategoryData(data.slice(0, 6));
  };

  const recentTransactions = transactions
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const budgetAlerts = budgets.filter((b: any) => {
    const spent = transactions
      .filter((t: any) => t.type === 'expense' && t.categoryId === b.categoryId)
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const percentage = (spent / b.amount) * 100;
    return percentage >= 70;
  });

  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 dark:text-white mb-1">Tổng quan tài chính</h2>
        <p className="text-gray-600 dark:text-gray-400">Theo dõi tình hình tài chính của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Tổng Thu</p>
          <p className="text-gray-800 dark:text-white font-bold text-lg">{totalIncome.toLocaleString('vi-VN')}₫</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Tổng Chi</p>
          <p className="text-gray-800 dark:text-white font-bold text-lg">{totalExpense.toLocaleString('vi-VN')}₫</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Số dư</p>
          <p className={`font-bold text-lg ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {balance.toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-orange-900 dark:text-orange-300 mb-2 font-semibold">Cảnh báo ngân sách</h3>
              <div className="space-y-2">
                {budgetAlerts.map((budget: any) => {
                  const spent = transactions
                    .filter((t: any) => t.type === 'expense' && t.categoryId === budget.categoryId)
                    .reduce((sum: number, t: any) => sum + t.amount, 0);
                  const percentage = ((spent / budget.amount) * 100).toFixed(0);
                  const cat = categories.find((c: any) => c.id === budget.categoryId);

                  return (
                    <div key={budget.id} className="text-orange-800 dark:text-orange-200">
                      <span className="font-medium">{cat?.name || 'Danh mục'}</span>: Đã chi {percentage}% ngân sách
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income/Expense Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white mb-4 font-semibold">Thu chi 7 ngày qua</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
              <XAxis dataKey="date" stroke="#999" tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#999" tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Thu"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Chi"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white mb-4 font-semibold">Chi tiêu theo danh mục</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
              Chưa có dữ liệu chi tiêu
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 dark:text-white font-semibold">Giao dịch gần đây</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((tx: any) => {
              const cat = categories.find((c: any) => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white font-medium">{tx.description}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{cat?.name || 'Khác'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {tx.amount.toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{tx.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            Chưa có giao dịch nào
          </div>
        )}
      </div>
    </div>
  );
}
