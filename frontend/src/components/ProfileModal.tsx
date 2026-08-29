import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, login, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen && user?.role === 'STUDENT' && user.majorId) {
      setSelectedLevel(user.levelId || '');
      api.get(`/academic/levels?majorId=${user.majorId}`)
        .then(res => setLevels(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen, user]);

  const handleUpdateLevel = async () => {
    if (!selectedLevel) return;
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.put('/users/profile', { levelId: Number(selectedLevel) });
      // Update local context
      if (user && token) {
        login({ ...user, levelId: Number(selectedLevel) }, token);
      }
      setSuccess('تم تحديث مستواك الدراسي بنجاح! 🎉');
      setTimeout(() => {
        onClose();
        window.location.reload(); // Reload to fetch new subjects
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التحديث.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">الملف الشخصي</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                ✖
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                <p className="text-gray-500 font-medium">{user?.phone}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                  {user?.role === 'STUDENT' ? 'طالب' : user?.role === 'REPRESENTATIVE' ? 'مندوب' : 'مدير'}
                </span>
              </div>
            </div>

            {user?.role === 'STUDENT' && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📈</span> ترقية المستوى الدراسي
                </h4>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  هل انتقلت إلى مستوى دراسي جديد؟ يمكنك تحديث مستواك هنا لتظهر لك المواد الجديدة.
                </p>
                
                <select 
                  value={selectedLevel} 
                  onChange={(e) => setSelectedLevel(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-4 font-medium text-gray-700"
                >
                  <option value="">اختر مستواك الحالي...</option>
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>

                {error && <p className="text-red-500 text-sm font-bold mb-3">{error}</p>}
                {success && <p className="text-green-500 text-sm font-bold mb-3">{success}</p>}

                <button 
                  onClick={handleUpdateLevel}
                  disabled={loading || selectedLevel === user.levelId || !selectedLevel}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  {loading ? 'جاري التحديث...' : 'تحديث المستوى'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileModal;
