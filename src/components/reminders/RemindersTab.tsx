import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Bell, Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Select } from '../common/Select';
import { DayPicker } from '../common/DayPicker';

interface RemindersTabProps {
  userId: string;
}

export function RemindersTab({ userId }: RemindersTabProps) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'income',
    categoryId: '',
    amount: '',
    frequency: 'monthly',
    dayOfMonth: '1',
    enabled: true
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const rems = JSON.parse(localStorage.getItem(`reminders_${userId}`) || '[]');
    const cats = JSON.parse(localStorage.getItem(`categories_${userId}`) || '[]');
    
    setReminders(rems);
    setCategories(cats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rems = [...reminders];
    if (editingReminder) {
      const index = rems.findIndex((r: any) => r.id === editingReminder.id);
      rems[index] = {
        ...editingReminder,
        ...formData,
        amount: parseFloat(formData.amount)
      };
    } else {
      const newReminder = {
        id: Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString()
      };
      rems.push(newReminder);
    }

    localStorage.setItem(`reminders_${userId}`, JSON.stringify(rems));
    setReminders(rems);
    setShowForm(false);
    setEditingReminder(null);
    setFormData({
      title: '',
      type: 'income',
      categoryId: '',
      amount: '',
      frequency: 'monthly',
      dayOfMonth: '1',
      enabled: true
    });
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      type: reminder.type,
      categoryId: reminder.categoryId,
      amount: reminder.amount.toString(),
      frequency: reminder.frequency,
      dayOfMonth: reminder.dayOfMonth,
      enabled: reminder.enabled
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa nhắc nhở này?')) {
      const rems = reminders.filter((r: any) => r.id !== id);
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(rems));
      setReminders(rems);
    }
  };

  const toggleReminder = (id: string) => {
    const rems = reminders.map((r: any) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    localStorage.setItem(`reminders_${userId}`, JSON.stringify(rems));
    setReminders(rems);
  };

  const getNextReminderDate = (reminder: any) => {
    const today = new Date();
    const dayOfMonth = parseInt(reminder.dayOfMonth);
    
    let nextDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    if (nextDate < today) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate.toLocaleDateString('vi-VN');
  };

  const incomeReminders = reminders.filter((r: any) => r.type === 'income');
  const expenseReminders = reminders.filter((r: any) => r.type === 'expense');

  const relevantCategories = categories.filter(
    (cat: any) => cat.type === formData.type
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 dark:text-white">Lịch nhắc & Tự động hóa</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý các khoản thu chi định kỳ</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingReminder(null);
            setFormData({
              title: '',
              type: 'income',
              categoryId: '',
              amount: '',
              frequency: 'monthly',
              dayOfMonth: '1',
              enabled: true
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm nhắc nhở
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-900 dark:text-blue-300 mb-1 font-medium">Tính năng nhắc nhở</h3>
            <p className="text-blue-800 dark:text-blue-200">
              Thiết lập nhắc nhở cho các khoản thu chi định kỳ như học bổng, tiền trọ, 
              tiền điện... Hệ thống sẽ nhắc bạn vào ngày đã đặt.
            </p>
          </div>
        </div>
      </div>

      {/* Reminder Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white mb-4 font-semibold">
            {editingReminder ? 'Sửa nhắc nhở' : 'Thêm nhắc nhở mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Loại</label>
              <Select
                value={formData.type}
                onChange={(value) => setFormData({ ...formData, type: value, categoryId: '' })}
                options={[
                  { value: 'income', label: 'Thu nhập', icon: '💰' },
                  { value: 'expense', label: 'Chi tiêu', icon: '💸' }
                ]}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ví dụ: Học bổng tháng, Tiền trọ..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Số tiền (₫)</label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Tần suất</label>
                <Select
                  value={formData.frequency}
                  onChange={(value) => setFormData({ ...formData, frequency: value })}
                  options={[
                    { value: 'monthly', label: 'Hàng tháng', icon: '📅' }
                  ]}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Ngày trong tháng</label>
                <DayPicker
                  value={formData.dayOfMonth}
                  onChange={(value) => setFormData({ ...formData, dayOfMonth: value })}
                  maxDays={28}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingReminder ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingReminder(null);
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-gray-800 dark:text-white font-medium">Nhắc nhở Thu nhập</h3>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
            {incomeReminders.length}
          </span>
        </div>
        {incomeReminders.length > 0 ? (
          <div className="space-y-3">
            {incomeReminders.map((reminder: any) => {
              const category = categories.find((c: any) => c.id === reminder.categoryId);
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                        reminder.enabled
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <Bell className="w-6 h-6" />
                    </button>
                    <div>
                      <h4 className="text-gray-800 dark:text-white font-medium">{reminder.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-gray-600 dark:text-gray-400 text-sm">
                        <span className="flex items-center gap-1">
                          {category?.icon} {category?.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ngày {reminder.dayOfMonth} hàng tháng
                        </span>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {reminder.amount.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                        Lần tới: {getNextReminderDate(reminder)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            Chưa có nhắc nhở thu nhập nào
          </div>
        )}
      </div>

      {/* Expense Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-gray-800 dark:text-white font-medium">Nhắc nhở Chi tiêu</h3>
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm">
            {expenseReminders.length}
          </span>
        </div>
        {expenseReminders.length > 0 ? (
          <div className="space-y-3">
            {expenseReminders.map((reminder: any) => {
              const category = categories.find((c: any) => c.id === reminder.categoryId);
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                        reminder.enabled
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <Bell className="w-6 h-6" />
                    </button>
                    <div>
                      <h4 className="text-gray-800 dark:text-white font-medium">{reminder.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-gray-600 dark:text-gray-400 text-sm">
                        <span className="flex items-center gap-1">
                          {category?.icon} {category?.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ngày {reminder.dayOfMonth} hàng tháng
                        </span>
                        <span>•</span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {reminder.amount.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                        Lần tới: {getNextReminderDate(reminder)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            Chưa có nhắc nhở chi tiêu nào
          </div>
        )}
      </div>
    </div>
  );
}