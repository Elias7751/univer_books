import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { phone });
      setSuccess('تم إرسال رمز التحقق إلى حسابك في التيليجرام');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال الرمز. تأكد من رقم الهاتف.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/reset-password', { phone, otp, newPassword });
      setSuccess('تم تغيير كلمة المرور بنجاح! سيتم تحويلك لتسجيل الدخول...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div>
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span className="text-white text-3xl font-bold">U</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            استعادة كلمة المرور
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            {step === 1 ? 'أدخل رقم هاتفك لاستلام رمز التحقق عبر التيليجرام' : 'أدخل رمز التحقق وكلمة المرور الجديدة'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl">
            <p className="text-sm text-green-700 font-bold">{success}</p>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف</label>
              <input 
                id="phone" 
                name="phone" 
                type="tel" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm text-left" 
                placeholder="770000000" 
                dir="ltr"
              />
            </div>
            <div>
              <button 
                type="submit" 
                disabled={loading}
                className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary hover:shadow-lg transform hover:-translate-y-0.5'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300`}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-bold text-gray-700 mb-1">رمز التحقق (6 أرقام)</label>
                <input 
                  id="otp" 
                  name="otp" 
                  type="text" 
                  required 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm text-center tracking-widest text-lg font-bold" 
                  placeholder="123456" 
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <input 
                  id="newPassword" 
                  name="newPassword" 
                  type="password" 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm text-left" 
                  placeholder="••••••••" 
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <button 
                type="submit" 
                disabled={loading}
                className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 hover:shadow-lg transform hover:-translate-y-0.5'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300`}
              >
                {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
