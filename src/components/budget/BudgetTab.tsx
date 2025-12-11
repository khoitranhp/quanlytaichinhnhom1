import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, TrendingDown, Wallet, X } from 'lucide-react';
import { Select } from '../common/Select';

interface BudgetTabProps {
  userId: string;
}

export function BudgetTab({ userId }: BudgetTabProps) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly'
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const buds = JSON.parse(localStorage.getItem(`budgets_${userId}`) || '[]');
    const cats = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    const txs = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
    
    setBudgets(buds);
    setCategories(cats.filter((c: any) => c.type === 'expense'));
    setTransactions(txs.filter((t: any) => t.type === 'expense'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const buds = [...budgets];
    if (editingBudget) {
      const index = buds.findIndex((b: any) => b.id === editingBudget.id);
      buds[index] = {
        ...editingBudget,
        ...formData,
        amount: parseFloat(formData.amount)
      };
    } else {
      // Check if budget already exists for this category
      if (buds.some((b: any) => b.categoryId === formData.categoryId)) {
        alert('Ngân sách cho danh mục này đã tồn tại');
        return;
      }

      const newBudget = {
        id: Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString()
      };
      buds.push(newBudget);
    }

    localStorage.setItem(`budgets_${userId}`, JSON.stringify(buds));
    setBudgets(buds);
    setShowForm(false);
    setEditingBudget(null);
    setFormData({ categoryId: '', amount: '', period: 'monthly' });
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa ngân sách này?')) {
      const buds = budgets.filter((b: any) => b.id !== id);
      localStorage.setItem(`budgets_${userId}`, JSON.stringify(buds));
      setBudgets(buds);
    }
  };

  const calculateSpent = (categoryId: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions
      .filter((t: any) => {
        const txDate = new Date(t.date);
        return (
          t.categoryId === categoryId &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, t: any) => sum + t.amount, 0);
  };

  const getAlertLevel = (percentage: number) => {
    if (percentage >= 100) return { color: 'red', text: 'Vượt ngân sách!', icon: '🚨' };
    if (percentage >= 90) return { color: 'red', text: 'Cảnh báo: 90%', icon: '⚠️' };
    if (percentage >= 70) return { color: 'orange', text: 'Chú ý: 70%', icon: '⚡' };
    return { color: 'green', text: 'An toàn', icon: '✅' };
  };

  const totalBudget = budgets.reduce((sum: number, b: any) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum: number, b: any) => sum + calculateSpent(b.categoryId), 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const categoryOptions = categories.map((cat: any) => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon
  }));

  const periodOptions = [
    { value: 'monthly', label: 'Hàng tháng' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 dark:text-white">Quản lý ngân sách</h2>
          <p className="text-gray-600 dark:text-gray-400">Kiểm soát chi tiêu của bạn</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingBudget(null);
            setFormData({ categoryId: '', amount: '', period: 'monthly' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm ngân sách
        </button>
      </div>

      {/* Overall Budget Summary */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-8 h-8" />
          <div>
            <h3 className="text-white font-semibold">Tổng ngân sách tháng này</h3>
            <p className="text-indigo-100">
              Đã chi {totalSpent.toLocaleString('vi-VN')}₫ / {totalBudget.toLocaleString('vi-VN')}₫
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{totalPercentage.toFixed(0)}%</span>
            <span>{(totalBudget - totalSpent).toLocaleString('vi-VN')}₫ còn lại</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full transition-all ${
                totalPercentage >= 100
                  ? 'bg-red-400'
                  : totalPercentage >= 70
                  ? 'bg-orange-400'
                  : 'bg-green-400'
              }`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingBudget(null);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-gray-800 dark:text-white mb-4 font-semibold">
            {editingBudget ? 'Sửa ngân sách' : 'Thêm ngân sách mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Danh mục chi tiêu</label>
              <Select
                value={formData.categoryId}
                options={categoryOptions}
                onChange={(value) => setFormData({ ...formData, categoryId: value })}
                placeholder="Chọn danh mục"
                disabled={!!editingBudget}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Số tiền ngân sách (₫)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Chu kỳ</label>
              <Select
                value={formData.period}
                options={periodOptions}
                onChange={(value) => setFormData({ ...formData, period: value })}
                placeholder="Chọn chu kỳ"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {editingBudget ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBudget(null);
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets List */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget: any) => {
            const category = categories.find((c: any) => c.id === budget.categoryId);
            const spent = calculateSpent(budget.categoryId);
            const percentage = (spent / budget.amount) * 100;
            const alert = getAlertLevel(percentage);

            return (
              <div
                key={budget.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">{category?.icon || '📁'}</span>
                    <div>
                      <h3 className="text-gray-800 dark:text-white font-semibold">{category?.name || 'Khác'}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                         Hàng tháng
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-end mb-1">
                         <span className="text-2xl font-bold text-gray-800 dark:text-white">
                             {spent.toLocaleString('vi-VN')}₫
                         </span>
                         <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                             / {budget.amount.toLocaleString('vi-VN')}₫
                         </span>
                    </div>
                </div>

                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span>{percentage.toFixed(0)}%</span>
                    <span>{(budget.amount - spent).toLocaleString('vi-VN')}₫ còn lại</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage >= 100
                          ? 'bg-red-500'
                          : percentage >= 90
                          ? 'bg-red-400'
                          : percentage >= 70
                          ? 'bg-orange-400'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                
                 <div className={`mt-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                    alert.color === 'red'
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800'
                          : alert.color === 'orange'
                          ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800'
                 }`}>
                    <span>{alert.icon}</span>
                    <span>{alert.text}</span>
                 </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-800 dark:text-white mb-2">Chưa có ngân sách nào</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tạo ngân sách để kiểm soát chi tiêu của bạn
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tạo ngân sách đầu tiên
          </button>
        </div>
      )}
    </div>
  );
}