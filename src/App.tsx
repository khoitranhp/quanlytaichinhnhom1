import { useState, useEffect } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { DataProvider } from './contexts/DataContext';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    checkSession();
    
    // Check theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let name = session.user.user_metadata?.name || '';
        if (session.user.email === 'khoi@gmail.com') {
          name = 'Trần Đăng Khôi';
        }
        
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          name: name,
          isGuest: false
        });
      } else {
        // Create guest user
        setCurrentUser({
          id: 'guest',
          email: 'guest@local',
          name: 'Khách',
          isGuest: true
        });
      }
    } catch (error) {
      console.log('Session check error:', error);
      // Create guest user on error
      setCurrentUser({
        id: 'guest',
        email: 'guest@local',
        name: 'Khách',
        isGuest: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('Login error:', error);
        return false;
      }

      if (data.user) {
        let name = data.user.user_metadata?.name || '';
        if (data.user.email === 'khoi@gmail.com') {
           name = 'Trần Đăng Khôi';
        }

        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: name,
          isGuest: false
        });
        setShowAuthModal(false);
        return true;
      }

      return false;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-743362cc/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(userData)
        }
      );

      const result = await response.json();

      if (response.ok && result.user) {
        // Now sign in with the created account
        return await handleLogin(userData.email, userData.password);
      }

      console.log('Registration error:', result.error);
      return false;
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Switch back to guest mode
    setCurrentUser({
      id: 'guest',
      email: 'guest@local',
      name: 'Khách',
      isGuest: true
    });
    setShowAuthModal(false);
  };

  const handleGoogleLogin = async () => {
    try {
      // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Google login error:', error);
        alert('Lỗi đăng nhập Google. Vui lòng đảm bảo bạn đã cấu hình Google OAuth trong Supabase.');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Always show Dashboard (guest or authenticated user)
  return (
    <DataProvider>
      <Dashboard 
        user={currentUser} 
        onLogout={handleLogout}
        onShowAuth={() => setShowAuthModal(true)}
      />
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {showRegister ? (
              <RegisterForm
                onRegister={handleRegister}
                onSwitchToLogin={() => setShowRegister(false)}
                onClose={() => setShowAuthModal(false)}
              />
            ) : (
              <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setShowRegister(true)}
                onGoogleLogin={handleGoogleLogin}
                onClose={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </DataProvider>
  );
}