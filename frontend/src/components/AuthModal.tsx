// src/components/AuthModal.tsx (Phiên bản đã FIX lỗi Type)

import React, { useState } from 'react';
import { User, Lock, Mail, LogIn, UserPlus } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // BẮT ĐẦU LOGIC GIẢ LẬP
    try {
        if (isRegisterMode) {
            // Giả lập Đăng ký thành công
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            setIsRegisterMode(false);
            setUsername(''); 
            setPassword('');
            setEmail('');
        } else {
            // Giả lập Đăng nhập thành công
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockToken = 'mock-jwt-token-12345';
            const mockUser = { _id: 'mock-id-123', username: username };
            
            login(mockToken, mockUser);
            onClose(); 
        }
    } catch (err) {
         setError('Lỗi kết nối hoặc xác thực thất bại.');
         addNotification('Đăng nhập thất bại.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className={`p-5 text-white ${isRegisterMode ? 'bg-blue-600' : 'bg-green-600'}`}>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {isRegisterMode ? <UserPlus size={24} /> : <LogIn size={24} />}
            {isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Hệ Thống'}
          </h3>
          <p className="text-sm opacity-90 mt-1">
            {isRegisterMode ? 'Quản lý tài chính cá nhân' : 'Tiếp tục phiên làm việc'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Username */}
          <div className="relative">
            <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tên đăng nhập (Username)"
              value={username}
              // FIX LỖI TYPE: Sử dụng e.target.value || '' để đảm bảo giá trị là string
              onChange={(e) => setUsername(e.target.value || '')} 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              // FIX LỖI TYPE: Sử dụng e.target.value || '' để đảm bảo giá trị là string
              onChange={(e) => setPassword(e.target.value || '')} 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
              required
              disabled={loading}
            />
          </div>

          {/* Email (Chỉ trong chế độ Đăng ký) */}
          {isRegisterMode && (
             <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email (Tùy chọn)"
                  value={email}
                  // FIX LỖI TYPE: Sử dụng e.target.value || '' để đảm bảo giá trị là string
                  onChange={(e) => setEmail(e.target.value || '')} 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                  disabled={loading}
                />
            </div>
          )}

          {/* Hiển thị lỗi xác thực (nếu có) */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 
              ${isRegisterMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={loading}
          >
            {loading ? (
                // Hiển thị animation Loading
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    {isRegisterMode ? <UserPlus size={20} /> : <LogIn size={20} />}
                    {isRegisterMode ? 'Đăng Ký' : 'Đăng Nhập'}
                </>
            )}
          </button>
        </form>

        {/* Footer: Chuyển đổi Mode */}
        <div className="p-4 border-t border-gray-100 text-center bg-gray-50">
          <button
            type="button"
            onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError('');
                setUsername('');
                setPassword('');
                setEmail('');
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {isRegisterMode 
              ? 'Đã có tài khoản? Đăng nhập ngay.' 
              : 'Chưa có tài khoản? Đăng ký tại đây.'}
          </button>
        </div>
      </div>
    </div>
  );
};