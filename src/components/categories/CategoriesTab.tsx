import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Select } from '../common/Select';

interface CategoriesTabProps {
  userId: string;
}

const DEFAULT_CATEGORIES = [
  // Income categories
  { name: 'Lương', type: 'income', icon: '💰', isDefault: true },
  { name: 'Học bổng', type: 'income', icon: '🎓', isDefault: true },
  { name: 'Trợ cấp gia đình', type: 'income', icon: '👨‍👩‍👧', isDefault: true },
  { name: 'Làm thêm', type: 'income', icon: '💼', isDefault: true },
  { name: 'Thu nhập khác', type: 'income', icon: '💵', isDefault: true },
  // Expense categories
  { name: 'Ăn uống', type: 'expense', icon: '🍜', isDefault: true },
  { name: 'Học tập', type: 'expense', icon: '📚', isDefault: true },
  { name: 'Nhà trọ', type: 'expense', icon: '🏠', isDefault: true },
  { name: 'Di chuyển', type: 'expense', icon: '🚗', isDefault: true },
  { name: 'Giải trí', type: 'expense', icon: '🎮', isDefault: true },
  { name: 'Mua sắm', type: 'expense', icon: '🛍️', isDefault: true },
  { name: 'Sức khỏe', type: 'expense', icon: '💊', isDefault: true },
  { name: 'Điện nước', type: 'expense', icon: '💡', isDefault: true },
  { name: 'Internet', type: 'expense', icon: '📱', isDefault: true },
  { name: 'Chi tiêu khác', type: 'expense', icon: '💸', isDefault: true }
];

export function CategoriesTab({ userId }: CategoriesTabProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: '📁'
  });

  useEffect(() => {
    loadCategories();
  }, [userId]);

  const loadCategories = () => {
    let cats = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    
    // Initialize with default categories if empty
    if (cats.length === 0) {
      cats = DEFAULT_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: `default_${index}`,
        userId
      }));
      localStorage.setItem(`categories_${userId}`, JSON.stringify(cats));
    }
    
    setCategories(cats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cats = [...categories];
    if (editingCategory) {
      const index = cats.findIndex((c: any) => c.id === editingCategory.id);
      cats[index] = {
        ...editingCategory,
        ...formData
      };
    } else {
      const newCat = {
        id: Date.now().toString(),
        ...formData,
        userId,
        isDefault: false,
        createdAt: new Date().toISOString()
      };
      cats.push(newCat);
    }

    localStorage.setItem(`categories_${userId}`, JSON.stringify(cats));
    setCategories(cats);
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', type: 'expense', icon: '📁' });
  };

  const handleEdit = (cat: any) => {
    if (cat.isDefault) {
      alert('Không thể sửa danh mục mặc định của hệ thống');
      return;
    }
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      icon: cat.icon
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const cat = categories.find((c: any) => c.id === id);
    if (cat?.isDefault) {
      alert('Không thể xóa danh mục mặc định của hệ thống');
      return;
    }

    // Check if category is being used
    const transactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
    const isUsed = transactions.some((t: any) => t.categoryId === id);
    
    if (isUsed) {
      alert('Không thể xóa danh mục đang được sử dụng trong giao dịch');
      return;
    }

    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      const cats = categories.filter((c: any) => c.id !== id);
      localStorage.setItem(`categories_${userId}`, JSON.stringify(cats));
      setCategories(cats);
    }
  };

  const incomeCategories = categories.filter((c: any) => c.type === 'income');
  const expenseCategories = categories.filter((c: any) => c.type === 'expense');

  const typeOptions = [
    { value: 'income', label: 'Thu nhập' },
    { value: 'expense', label: 'Chi tiêu' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 dark:text-white">Danh mục thu chi</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý danh mục để phân loại giao dịch</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: '', type: 'expense', icon: '📁' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-gray-800 dark:text-white mb-4">
            {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Loại danh mục</label>
              <Select
                value={formData.type}
                options={typeOptions}
                onChange={(value) => setFormData({ ...formData, type: value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Tên danh mục</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ví dụ: Ăn sáng, Học phí..."
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Biểu tượng</label>
              <div className="flex gap-2 flex-wrap">
                {['📁', '💰', '🎓', '🍜', '🏠', '🚗', '🎮', '💊', '📚', '💡'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`w-12 h-12 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      formData.icon === emoji
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingCategory ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-gray-800 dark:text-white">Danh mục Thu nhập</h3>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
            {incomeCategories.length}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {incomeCategories.map((cat: any) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-500 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{cat.icon}</span>
                <div className="min-w-0">
                  <p className="text-gray-800 dark:text-white truncate">{cat.name}</p>
                  {cat.isDefault && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Mặc định</span>
                  )}
                </div>
              </div>
              {!cat.isDefault && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-600" />
          <h3 className="text-gray-800 dark:text-white">Danh mục Chi tiêu</h3>
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm">
            {expenseCategories.length}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {expenseCategories.map((cat: any) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-500 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{cat.icon}</span>
                <div className="min-w-0">
                  <p className="text-gray-800 dark:text-white truncate">{cat.name}</p>
                  {cat.isDefault && (
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Mặc định</span>
                  )}
                </div>
              </div>
              {!cat.isDefault && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}