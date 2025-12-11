import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Moon,
  Sun
} from 'lucide-react';
import { Select } from '../common/Select';

interface SettingsTabProps {
  user: any;
}

export function SettingsTab({ user }: SettingsTabProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'appearance'>('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Appearance settings
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'vi');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...profileData };
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Verify current password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === user.id);
    
    if (currentUser?.password !== passwordData.currentPassword) {
      alert('Mật khẩu hiện tại không đúng');
      return;
    }

    // Update password
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].password = passwordData.newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    }

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveAppearance = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);

    // Apply theme immediately
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const sections = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
    { id: 'appearance', label: 'Giao diện', icon: Palette }
  ];

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt', icon: '🇻🇳' },
    { value: 'en', label: 'English', icon: '🇺🇸' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 dark:text-white">Cài đặt</h2>
        <p className="text-gray-600 dark:text-gray-400">Quản lý tài khoản và tùy chỉnh hệ thống</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-300">Đã lưu thay đổi thành công!</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          {activeSection === 'profile' && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-4">Thông tin cá nhân</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </button>
              </form>
            </div>
          )}

          {activeSection === 'password' && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-4">Đổi mật khẩu</h3>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value
                        })
                      }
                      className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={6}
                  />
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Tối thiểu 6 ký tự</p>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Đổi mật khẩu
                </button>
              </form>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h3 className="text-gray-800 dark:text-white mb-4">Tùy chỉnh giao diện</h3>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-3">Chủ đề màu sắc</label>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      theme === 'light' 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
                    }`}>
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={theme === 'light'}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <Sun className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-gray-800 dark:text-white">Sáng (Light)</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Giao diện sáng, dễ nhìn ban ngày</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      theme === 'dark' 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
                    }`}>
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={theme === 'dark'}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <Moon className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-gray-800 dark:text-white">Tối (Dark)</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Giao diện tối, bảo vệ mắt ban đêm</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    <Globe className="inline w-5 h-5 mr-2" />
                    Ngôn ngữ
                  </label>
                  <Select
                    value={language}
                    options={languageOptions}
                    onChange={(value) => setLanguage(value)}
                    placeholder="Chọn ngôn ngữ"
                  />
                </div>

                <button
                  onClick={handleSaveAppearance}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Lưu cài đặt
                </button>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-300">
                    💡 Lưu ý: Một số tùy chỉnh giao diện sẽ được áp dụng trong các phiên bản tương lai.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}