import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Target, TrendingUp, DollarSign } from 'lucide-react';

interface GoalsTabProps {
  userId: string;
}

export function GoalsTab({ userId }: GoalsTabProps) {
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    icon: '🎯'
  });

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = () => {
    const goalsData = JSON.parse(localStorage.getItem(`goals_${userId}`) || '[]');
    setGoals(goalsData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goalsData = [...goals];
    if (editingGoal) {
      const index = goalsData.findIndex((g: any) => g.id === editingGoal.id);
      goalsData[index] = {
        ...editingGoal,
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount)
      };
    } else {
      const newGoal = {
        id: Date.now().toString(),
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        createdAt: new Date().toISOString()
      };
      goalsData.push(newGoal);
    }

    localStorage.setItem(`goals_${userId}`, JSON.stringify(goalsData));
    setGoals(goalsData);
    setShowForm(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
      icon: '🎯'
    });
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      icon: goal.icon
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
      const goalsData = goals.filter((g: any) => g.id !== id);
      localStorage.setItem(`goals_${userId}`, JSON.stringify(goalsData));
      setGoals(goalsData);
    }
  };

  const handleAddFunds = (goalId: string) => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;

    const goalsData = [...goals];
    const index = goalsData.findIndex((g: any) => g.id === goalId);
    goalsData[index].currentAmount += parseFloat(addAmount);

    localStorage.setItem(`goals_${userId}`, JSON.stringify(goalsData));
    setGoals(goalsData);
    setShowAddFunds(null);
    setAddAmount('');
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800 dark:text-white">Mục tiêu tiết kiệm</h2>
          <p className="text-gray-600 dark:text-gray-400">Theo dõi tiến độ tiết kiệm của bạn</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingGoal(null);
            setFormData({
              name: '',
              targetAmount: '',
              currentAmount: '0',
              deadline: '',
              icon: '🎯'
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo mục tiêu
        </button>
      </div>

      {/* Goal Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-white mb-4 font-semibold">
            {editingGoal ? 'Sửa mục tiêu' : 'Tạo mục tiêu mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Biểu tượng</label>
              <div className="flex gap-2 flex-wrap">
                {['🎯', '💰', '💻', '📱', '🚗', '🏠', '✈️', '🎓', '💍', '🎮'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`w-12 h-12 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      formData.icon === emoji
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Tên mục tiêu</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ví dụ: Mua laptop mới, Đi du lịch..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Số tiền mục tiêu (₫)</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Số tiền hiện tại (₫)</label>
                <input
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Hạn chót</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingGoal ? 'Cập nhật' : 'Tạo'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                }}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal: any) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = calculateDaysLeft(goal.deadline);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${
                  isCompleted ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{goal.icon}</span>
                    <div>
                      <h3 className="text-gray-800 dark:text-white font-semibold">{goal.name}</h3>
                      {isCompleted ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                          <Target className="w-4 h-4" />
                          Đã hoàn thành!
                        </span>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã quá hạn'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tiến độ</span>
                    <span className="text-gray-800 dark:text-white font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                    <span>{goal.currentAmount.toLocaleString('vi-VN')}₫</span>
                    <span>{goal.targetAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {showAddFunds === goal.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          placeholder="Số tiền bỏ vào"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          min="0"
                        />
                        <button
                          onClick={() => handleAddFunds(goal.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => {
                            setShowAddFunds(null);
                            setAddAmount('');
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddFunds(goal.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        <DollarSign className="w-4 h-4" />
                        Bỏ tiền vào mục tiêu
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <Target className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-gray-800 dark:text-white mb-2 font-semibold">Chưa có mục tiêu nào</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tạo mục tiêu tiết kiệm để đạt được ước mơ của bạn
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tạo mục tiêu đầu tiên
          </button>
        </div>
      )}
    </div>
  );
}
