import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Academic State
  const [universities, setUniversities] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  const [selectedUni, setSelectedUni] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/academic/universities');
      setUniversities(res.data);
    } catch (err) { console.error(err); }
  };

  const handleUniChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uniId = e.target.value;
    setSelectedUni(uniId);
    setSelectedCollege(''); setSelectedDept(''); setSelectedLevel('');
    setColleges([]); setDepartments([]); setLevels([]);
    if (!uniId) return;
    try {
      const res = await api.get(`/academic/colleges?universityId=${uniId}`);
      setColleges(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCollegeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const colId = e.target.value;
    setSelectedCollege(colId);
    setSelectedDept(''); setSelectedLevel('');
    setDepartments([]); setLevels([]);
    if (!colId) return;
    try {
      const res = await api.get(`/academic/departments?collegeId=${colId}`);
      setDepartments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDeptChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    setSelectedDept(deptId);
    setSelectedLevel('');
    setLevels([]);
    if (!deptId) return;
    try {
      const res = await api.get(`/academic/levels?departmentId=${deptId}`);
      setLevels(res.data);
    } catch (err) { console.error(err); }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { 
        name, 
        phone, 
        password,
        universityId: selectedUni ? Number(selectedUni) : undefined,
        collegeId: selectedCollege ? Number(selectedCollege) : undefined,
        departmentId: selectedDept ? Number(selectedDept) : undefined,
        levelId: selectedLevel ? Number(selectedLevel) : undefined,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Language Switcher */}
      <motion.button 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={toggleLanguage}
        className="absolute top-6 right-6 md:top-8 md:right-8 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-sm font-bold text-gray-700 hover:bg-white border border-gray-100 transition-all hover:shadow-md z-20 flex items-center gap-2"
      >
        <span className="text-lg">🌐</span> {i18n.language === 'ar' ? 'English' : 'العربية'}
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [-10, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4"
            >
              <span className="text-white text-3xl font-extrabold">م</span>
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight mb-2">
              {t('register.title') || 'إنشاء حساب جديد'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {t('register.subtitle') || 'انضم إلى مجتمع مصدر الأكاديمي'}
            </p>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-50/80 backdrop-blur-sm border-r-4 border-red-500 p-4 rounded-xl flex items-center gap-3">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700">{t('register.name') || 'الاسم الكامل'}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <input 
                      id="name" name="name" type="text" required 
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full pr-12 pl-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all text-gray-800 font-medium" 
                      placeholder="علي أحمد" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700">رقم الهاتف</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    <input 
                      id="phone" name="phone" type="tel" required 
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="appearance-none block w-full pr-12 pl-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all text-left font-medium text-gray-800" 
                      placeholder="770000000" dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700">{t('register.password') || 'كلمة المرور'}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <input 
                      id="password" name="password" type="password" required 
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pr-12 pl-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all text-left font-medium text-gray-800 tracking-widest" 
                      placeholder="••••••••" dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="pt-6 mt-6 border-t border-gray-100 relative">
                <div className="absolute -left-8 top-6 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full hidden md:block"></div>
                <h3 className="text-sm font-extrabold text-indigo-600 mb-4 flex items-center gap-2">
                  <span>🎓</span> البيانات الأكاديمية
                </h3>
                
                <div className="space-y-3">
                  <div className="relative group">
                    <select 
                      value={selectedUni} onChange={handleUniChange} required
                      className="block w-full px-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all appearance-none font-medium text-gray-700"
                    >
                      <option value="">اختر الجامعة...</option>
                      {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative group">
                    <select 
                      value={selectedCollege} onChange={handleCollegeChange} required disabled={!selectedUni}
                      className="block w-full px-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all appearance-none font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">اختر الكلية...</option>
                      {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative group">
                    <select 
                      value={selectedDept} onChange={handleDeptChange} required disabled={!selectedCollege}
                      className="block w-full px-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all appearance-none font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">اختر القسم...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative group">
                    <select 
                      value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} required disabled={!selectedDept}
                      className="block w-full px-4 py-3 bg-white/50 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all appearance-none font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">اختر المستوى...</option>
                      {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}} className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white overflow-hidden transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200'
                }`}
              >
                {!loading && (
                  <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                )}
                
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('register.submitting') || 'جاري التسجيل...'}
                  </>
                ) : (
                  <>
                    {t('register.submit') || 'إنشاء الحساب'}
                    <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                  </>
                )}
              </button>
            </motion.div>
            
            <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                {t('register.has_account') || 'لديك حساب بالفعل؟'}{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors ml-1">
                  {t('register.login_link') || 'تسجيل الدخول'}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
