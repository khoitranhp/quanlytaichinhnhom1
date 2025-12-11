import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  FolderTree,
  PieChart,
  Target,
  Bell,
  Settings,
  LogOut,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Menu,
  X
} from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { TransactionsTab } from '../transactions/TransactionsTab';
import { CategoriesTab } from '../categories/CategoriesTab';
import { BudgetTab } from '../budget/BudgetTab';
import { ReportsTab } from '../reports/ReportsTab';
import { GoalsTab } from '../goals/GoalsTab';
import { RemindersTab } from '../reminders/RemindersTab';
import { SettingsTab } from '../settings/SettingsTab';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onShowAuth?: () => void;
}

export function Dashboard({ user, onLogout, onShowAuth }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const transactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
    const income = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const expense = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    setStats({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    });
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Giao dịch', icon: Receipt },
    { id: 'categories', label: 'Danh mục', icon: FolderTree },
    { id: 'budget', label: 'Ngân sách', icon: Wallet },
    { id: 'reports', label: 'Báo cáo', icon: PieChart },
    { id: 'goals', label: 'Mục tiêu', icon: Target },
    { id: 'reminders', label: 'Nhắc nhở', icon: Bell },
    { id: 'settings', label: 'Cài đặt', icon: Settings }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab userId={user.id} onStatsUpdate={calculateStats} />;
      case 'transactions':
        return <TransactionsTab userId={user.id} onUpdate={calculateStats} />;
      case 'categories':
        return <CategoriesTab userId={user.id} />;
      case 'budget':
        return <BudgetTab userId={user.id} />;
      case 'reports':
        return <ReportsTab userId={user.id} />;
      case 'goals':
        return <GoalsTab userId={user.id} />;
      case 'reminders':
        return <RemindersTab userId={user.id} />;
      case 'settings':
        return <SettingsTab user={user} />;
      default:
        return <OverviewTab userId={user.id} onStatsUpdate={calculateStats} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex relative transition-colors duration-200">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: drawer */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Close button - Mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-800 dark:text-white font-bold">Student Money</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Xin chào, {user.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-900 dark:text-green-300 text-sm">Thu</span>
              </div>
              <span className="text-green-700 dark:text-green-400 font-medium">
                {stats.totalIncome.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-red-900 dark:text-red-300 text-sm">Chi</span>
              </div>
              <span className="text-red-700 dark:text-red-400 font-medium">
                {stats.totalExpense.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-indigo-900 dark:text-indigo-300 text-sm">Còn lại</span>
              </div>
              <span className="text-indigo-700 dark:text-indigo-400 font-medium">
                {stats.balance.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {user.isGuest ? (
            <button
              onClick={onShowAuth}
              className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng nhập</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-gray-800 dark:text-white font-bold">Student Money</h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Guest User Banner */}
          {user.isGuest && (
            <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2">🎉 Chào mừng đến với Student Money!</h3>
                  <p className="text-indigo-100 mb-4 text-sm sm:text-base">
                    Bạn đang dùng chế độ Khách. Dữ liệu sẽ được lưu trên thiết bị này. 
                    Đăng ký tài khoản để đồng bộ dữ liệu trên mọi thiết bị!
                  </p>
                  <button
                    onClick={onShowAuth}
                    className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors text-sm sm:text-base"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}