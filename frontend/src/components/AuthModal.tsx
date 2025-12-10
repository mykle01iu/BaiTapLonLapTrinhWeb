// src/components/AuthModal.tsx

import React, { useState } from 'react';
import { User, Lock, Mail, LogIn, UserPlus, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const login = useExpenseStore(state => state.login);
  const addNotification = useExpenseStore(state => state.addNotification);
    
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const { authAPI } = await import('../services/api');
        
        if (isRegisterMode) {
            // Validation
            if (username.length < 3) {
                throw new Error('Username phải có ít nhất 3 ký tự');
            }
            if (password.length < 6) {
                throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
            }
            
            // Gọi API Register
            const data = await authAPI.register(username, password, email);
            
            if (data.success) {
                addNotification('✅ Đăng ký thành công! Đang đăng nhập...', 'success');
                
                // Auto login sau khi đăng ký thành công
                setTimeout(async () => {
                    const loginResult = await login(username, password);
                    if (loginResult.success) {
                        onClose();
                    }
                }, 1000);
            }
        } else {
            // Gọi API Login
            const result = await login(username, password);
            
            if (result.success) {
                onClose();
            } else {
                throw new Error(result.message || 'Đăng nhập thất bại');
            }
        }
    } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        addNotification(err.message || 'Xác thực thất bại', 'error');
    } finally {
        setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setError('');
    setShowPassword(false);
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all animate-fadeIn">
        
        {/* Header với Gradient */}
        <div className={`p-8 text-white relative overflow-hidden ${
          isRegisterMode 
            ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600' 
            : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700'
        }`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              {isRegisterMode ? <UserPlus size={32} /> : <LogIn size={32} />}
              <h3 className="text-2xl font-bold">
                {isRegisterMode ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
              </h3>
            </div>
            <p className="text-blue-100 text-sm">
              {isRegisterMode 
                ? 'Bắt đầu quản lý tài chính thông minh' 
                : 'Chào mừng bạn quay trở lại!'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} />
              Tên đăng nhập
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                required
                disabled={loading}
                minLength={3}
              />
              {username.length >= 3 && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
            {username.length > 0 && username.length < 3 && (
              <p className="text-xs text-red-500">Username phải có ít nhất 3 ký tự</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock size={16} />
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all pr-12"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password.length > 0 && password.length < 6 && (
              <p className="text-xs text-red-500">Mật khẩu phải có ít nhất 6 ký tự</p>
            )}
          </div>

          {/* Email Input (Chỉ trong chế độ Đăng ký) */}
          {isRegisterMode && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail size={16} />
                Email <span className="text-gray-400 text-xs">(Tùy chọn)</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                disabled={loading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
              <span className="text-red-500 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3.5 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isRegisterMode 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-300' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-300'
            } ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            disabled={loading}
          >
            {loading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isRegisterMode ? 'Đang đăng ký...' : 'Đang đăng nhập...'}</span>
                </div>
            ) : (
                <>
                    {isRegisterMode ? <UserPlus size={20} /> : <LogIn size={20} />}
                    {isRegisterMode ? 'Đăng Ký Ngay' : 'Đăng Nhập'}
                </>
            )}
          </button>
        </form>

        {/* Footer: Chuyển đổi Mode */}
        <div className="px-8 pb-8 pt-0">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">hoặc</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={toggleMode}
            className="w-full mt-4 py-3 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            {isRegisterMode 
              ? '🔐 Đã có tài khoản? Đăng nhập ngay' 
              : '✨ Chưa có tài khoản? Đăng ký miễn phí'}
          </button>
        </div>
      </div>
    </div>
  );
};