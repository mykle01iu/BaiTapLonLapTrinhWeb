import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';

export const NotificationSystem = () => {
    // Lấy state và action từ store
    const notifications = useExpenseStore(state => state.notifications);
    const removeNotification = useExpenseStore(state => state.removeNotification);

    const getIconAndColor = (type: 'warning' | 'error' | 'success') => {
        switch (type) {
            case 'warning':
                return { icon: <AlertTriangle size={20} />, color: 'bg-yellow-500 border-yellow-700' };
            case 'error':
                return { icon: <XCircle size={20} />, color: 'bg-red-500 border-red-700' };
            case 'success':
                return { icon: <CheckCircle size={20} />, color: 'bg-green-500 border-green-700' };
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-3">
            {notifications.map(n => {
                const { icon, color } = getIconAndColor(n.type);
                
                return (
                    <div 
                        key={n.id} 
                        // Thêm animation nhẹ khi xuất hiện
                        className={`max-w-xs p-4 rounded-xl shadow-xl border-l-4 text-white transition-all transform ease-out duration-300 ${color}`}
                        style={{ animation: 'fadeInRight 0.3s ease-out' }}
                        role="alert"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">{icon}</div>
                            <div className="flex-grow text-sm font-medium">
                                {n.message}
                            </div>
                            <button 
                                onClick={() => removeNotification(n.id)}
                                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};