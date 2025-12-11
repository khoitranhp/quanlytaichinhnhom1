import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon
} from 'lucide-react';
import { Select } from '../common/Select';

interface TransactionsTabProps {
  userId: string;
  onUpdate: () => void;
}

export function TransactionsTab({ userId, onUpdate }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    image: ''
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const txs = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
    const cats = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    setTransactions(txs);
    setCategories(cats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const txs = [...transactions];
    if (editingTransaction) {
      const index = txs.findIndex((t: any) => t.id === editingTransaction.id);
      txs[index] = {
        ...editingTransaction,
        ...formData,
        amount: parseFloat(formData.amount)
      };
    } else {
      const newTx = {
        id: Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString()
      };
      txs.push(newTx);
    }

    localStorage.setItem(`transactions_${userId}`, JSON.stringify(txs));
    setTransactions(txs);
    setShowForm(false);
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      image: ''
    });
    onUpdate();
  };

  const handleEdit = (tx: any) => {
    setEditingTransaction(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount.toString(),
      description: tx.description,
      categoryId: tx.categoryId,
      date: tx.date,
      image: tx.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
      const txs = transactions.filter((t: any) => t.id !== id);
      localStorage.setItem(`transactions_${userId}`, JSON.stringify(txs));
      setTransactions(txs);
      onUpdate();
    }
  };

  const handleExport = () => {
    const csv = [
      ['Ngày', 'Loại', 'Danh mục', 'Mô tả', 'Số tiền'].join(','),
      ...transactions.map((tx: any) => {
        const cat = categories.find((c: any) => c.id === tx.categoryId);
        return [
          tx.date,
          tx.type === 'income' ? 'Thu' : 'Chi',
          cat?.name || 'Khác',
          tx.description,
          tx.amount
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredTransactions = transactions
    .filter((tx: any) => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || tx.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const relevantCategories = categories.filter(
    (cat: any) => cat.type === formData.type
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 dark:text-white">Giao dịch tài chính</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thu chi của bạn</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTransaction(null);
            setFormData({
              type: 'expense',
              amount: '',
              description: '',
              categoryId: '',
              date: new Date().toISOString().split('T')[0],
              image: ''
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm giao dịch
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm giao dịch..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="income">Thu</option>
              <option value="expense">Chi</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white mb-4 font-semibold">
            {editingTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Loại giao dịch</label>
                <Select
                  value={formData.type}
                  onChange={(value) => setFormData({ ...formData, type: value, categoryId: '' })}
                  options={[
                    { value: 'expense', label: 'Chi tiêu', icon: '💸' },
                    { value: 'income', label: 'Thu nhập', icon: '💰' }
                  ]}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Số tiền (₫)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Danh mục</label>
              <Select
                value={formData.categoryId}
                onChange={(value) => setFormData({ ...formData, categoryId: value })}
                options={[
                  { value: '', label: 'Chọn danh mục' },
                  ...relevantCategories.map((cat: any) => ({
                    value: cat.id,
                    label: cat.name,
                    icon: cat.icon
                  }))
                ]}
                placeholder="Chọn danh mục"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mô tả giao dịch"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Ngày</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Hình ảnh hóa đơn (tùy chọn)
              </label>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="URL hình ảnh"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingTransaction ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTransactions.map((tx: any) => {
              const cat = categories.find((c: any) => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-800 dark:text-white font-medium truncate">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-[100px]">{cat?.name || 'Khác'}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <p
                        className={`font-medium whitespace-nowrap ${
                          tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {tx.amount.toLocaleString('vi-VN')}₫
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            Chưa có giao dịch nào
          </div>
        )}
      </div>
    </div>
  );
}