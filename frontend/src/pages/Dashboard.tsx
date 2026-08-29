import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from '../components/ProfileModal';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  // Academic Structure States
  const [universities, setUniversities] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Selected Filters
  const [selectedUni, setSelectedUni] = useState<number | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'ACADEMIC' | 'GENERAL'>('ACADEMIC');

  useEffect(() => {
    fetchUniversities();
    
    if (user?.role === 'STUDENT' && user.levelId) {
      setSelectedUni(user.universityId || null);
      setSelectedCollege(user.collegeId || null);
      setSelectedDept(user.departmentId || null); 
      setSelectedMajor(user.majorId || null);
      setSelectedLevel(user.levelId || null);
      
      api.get(`/academic/subjects?levelId=${user.levelId}`).then(res => {
        setSubjects(res.data);
      }).catch(console.error);
      
      fetchDocuments();
    } else {
      fetchDocuments();
    }
  }, [user]);

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/academic/universities');
      setUniversities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async (subjectId?: number, isGeneral: boolean = false) => {
    setLoadingDocs(true);
    try {
      let url = '/documents?';
      if (subjectId) url += `subjectId=${subjectId}&`;
      if (isGeneral) url += `isGeneral=true&`;
      
      const response = await api.get(url);
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoadingDocs(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'GENERAL') {
      fetchDocuments(undefined, true);
    } else {
      fetchDocuments(selectedSubject || undefined, false);
    }
  }, [activeTab]);

  const getAverageRating = (reviews?: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Handlers for Academic Selection
  const handleUniClick = async (id: number) => {
    if (selectedUni === id) {
      setSelectedUni(null); setColleges([]); setDepartments([]); setMajors([]); setLevels([]); setSubjects([]); setSelectedSubject(null);
      fetchDocuments();
      return;
    }
    setSelectedUni(id); setSelectedCollege(null); setSelectedDept(null); setSelectedMajor(null); setSelectedLevel(null); setSelectedSubject(null);
    setDepartments([]); setMajors([]); setLevels([]); setSubjects([]);
    try {
      const res = await api.get(`/academic/colleges?universityId=${id}`);
      setColleges(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCollegeClick = async (id: number) => {
    if (selectedCollege === id) {
      setSelectedCollege(null); setDepartments([]); setMajors([]); setLevels([]); setSubjects([]); setSelectedSubject(null);
      return;
    }
    setSelectedCollege(id); setSelectedDept(null); setSelectedMajor(null); setSelectedLevel(null); setSelectedSubject(null);
    setMajors([]); setLevels([]); setSubjects([]);
    try {
      const res = await api.get(`/academic/departments?collegeId=${id}`);
      setDepartments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDeptClick = async (id: number) => {
    if (selectedDept === id) {
      setSelectedDept(null); setMajors([]); setLevels([]); setSubjects([]); setSelectedSubject(null);
      return;
    }
    setSelectedDept(id); setSelectedMajor(null); setSelectedLevel(null); setSelectedSubject(null);
    setLevels([]); setSubjects([]);
    try {
      const res = await api.get(`/academic/majors?departmentId=${id}`);
      setMajors(res.data);
    } catch (err) { console.error(err); }
  };

  const handleMajorClick = async (id: number) => {
    if (selectedMajor === id) {
      setSelectedMajor(null); setLevels([]); setSubjects([]); setSelectedSubject(null);
      return;
    }
    setSelectedMajor(id); setSelectedLevel(null); setSelectedSubject(null);
    setSubjects([]);
    try {
      const res = await api.get(`/academic/levels?majorId=${id}`);
      setLevels(res.data);
    } catch (err) { console.error(err); }
  };

  const handleLevelClick = async (id: number) => {
    if (selectedLevel === id) {
      setSelectedLevel(null); setSubjects([]); setSelectedSubject(null);
      return;
    }
    setSelectedLevel(id); setSelectedSubject(null);
    try {
      const res = await api.get(`/academic/subjects?levelId=${id}`);
      setSubjects(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubjectClick = (id: number) => {
    setSelectedSubject(id);
    fetchDocuments(id);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
    setIsProfileOpen(false);
  };

  const filteredDocs = documents.filter(doc => 
    (selectedType ? doc.type === selectedType : true) &&
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const documentTypes = [
    { id: null, label: 'الكل', icon: '📁' },
    { id: 'BOOK', label: 'كتب وملازم', icon: '📚' },
    { id: 'SUMMARY', label: 'ملخصات', icon: '📝' },
    { id: 'EXAM', label: 'نماذج اختبارات', icon: '🎯' },
    { id: 'LECTURE', label: 'محاضرات', icon: '🎥' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-indigo-200 selection:text-indigo-900">
      
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100 transition-all">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-xl font-extrabold">م</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">مَصْدَر</h1>
            </div>
            
            {/* Desktop Document Type Tabs */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex space-x-2 rtl:space-x-reverse bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
                {documentTypes.map(type => (
                  <button
                    key={type.id || 'all'}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${selectedType === type.id ? 'bg-white text-indigo-600 shadow-sm border border-gray-200 transform scale-105' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse relative">
              {user?.role !== 'STUDENT' && (
                <button
                  onClick={() => navigate('/upload')}
                  className="hidden sm:flex px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                >
                  📤 رفع ملف
                </button>
              )}
              
              {/* Profile Dropdown Trigger */}
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 pr-4 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-gray-700 hidden sm:block">{user?.name}</span>
                <span className="text-gray-400 text-xs ml-1">▼</span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-16 left-0 rtl:left-auto rtl:right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                        <p className="text-xs text-indigo-600 font-bold mb-1">{t('dashboard.welcome') || 'مرحباً بك'}</p>
                        <p className="text-base font-extrabold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{user?.phone}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        {user?.role !== 'STUDENT' && (
                          <button 
                            onClick={() => { navigate('/upload'); setIsProfileOpen(false); }}
                            className="sm:hidden w-full text-start px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-3"
                          >
                            <span>📤</span> رفع ملف
                          </button>
                        )}
                        <button 
                          onClick={() => { setIsProfileModalOpen(true); setIsProfileOpen(false); }}
                          className="w-full text-start px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                          <span>👤</span> الملف الشخصي
                        </button>
                        <button 
                          onClick={toggleLanguage}
                          className="w-full text-start px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                          <span>🌐</span> {i18n.language === 'ar' ? 'English' : 'العربية'}
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-start px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
                        >
                          <span>🚪</span> {t('dashboard.logout') || 'تسجيل الخروج'}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex max-w-[1400px] mx-auto w-full relative">
        
        {/* Decorative Background for Main Content */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 -left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Sidebar for Academic Filter */}
        {activeTab === 'ACADEMIC' && (
        <aside className="w-72 hidden lg:block flex-shrink-0 border-l border-gray-200 bg-white/50 backdrop-blur-md min-h-[calc(100vh-5rem)] p-6 z-10 relative">
          <h2 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-indigo-600 text-xl">📚</span> تصفح الأقسام
          </h2>
          
          <div className="space-y-2">
            {universities.map(uni => (
              <div key={uni.id} className="mb-2">
                <button 
                  onClick={() => handleUniClick(uni.id)}
                  className={`w-full text-start px-4 py-3 rounded-xl font-bold transition-all flex justify-between items-center ${selectedUni === uni.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                >
                  <span className="truncate">🏛️ {uni.name}</span>
                  <span className="text-xs transition-transform duration-200" style={{ transform: selectedUni === uni.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </button>
                
                <AnimatePresence>
                  {selectedUni === uni.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-2 mr-4 pr-4 border-r-2 border-indigo-100 space-y-1 overflow-hidden"
                    >
                      {colleges.map(col => (
                        <div key={col.id}>
                          <button 
                            onClick={() => handleCollegeClick(col.id)}
                            className={`w-full text-start px-3 py-2 rounded-lg text-sm font-bold transition-all flex justify-between items-center ${selectedCollege === col.id ? 'text-indigo-700 bg-indigo-50/50' : 'text-gray-600 hover:text-indigo-600 hover:bg-white'}`}
                          >
                            <span className="truncate">🏢 {col.name}</span>
                          </button>
                          
                          <AnimatePresence>
                            {selectedCollege === col.id && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 mr-3 pr-3 border-r-2 border-indigo-50 space-y-1 overflow-hidden">
                                {departments.map(dept => (
                                  <div key={dept.id}>
                                    <button 
                                      onClick={() => handleDeptClick(dept.id)}
                                      className={`w-full text-start px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedDept === dept.id ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                                    >
                                      📚 {dept.name}
                                    </button>
                                    
                                    <AnimatePresence>
                                      {selectedDept === dept.id && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 mr-3 pr-3 border-r-2 border-gray-100 space-y-1 overflow-hidden">
                                          {majors.map(major => (
                                            <div key={major.id}>
                                              <button 
                                                onClick={() => handleMajorClick(major.id)}
                                                className={`w-full text-start px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMajor === major.id ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                                              >
                                                🎓 {major.name}
                                              </button>
                                              
                                              <AnimatePresence>
                                                {selectedMajor === major.id && (
                                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 mr-3 pr-3 border-r-2 border-gray-100 space-y-1 overflow-hidden">
                                                    {levels.map(level => (
                                                      <div key={level.id}>
                                                        <button 
                                                          onClick={() => handleLevelClick(level.id)}
                                                          className={`w-full text-start px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedLevel === level.id ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                                                        >
                                                          📈 {level.name}
                                                        </button>
                                                        
                                                        <AnimatePresence>
                                                          {selectedLevel === level.id && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 mr-3 pr-3 border-r-2 border-gray-100 space-y-1 overflow-hidden">
                                                                {subjects.filter(s => s.semester === 1).length > 0 && (
                                                                  <div className="mb-2">
                                                                    <div className="text-[10px] font-bold text-gray-400 mb-1 px-2">الفصل الأول</div>
                                                                    {subjects.filter(s => s.semester === 1).map(sub => (
                                                                      <button 
                                                                        key={sub.id}
                                                                        onClick={() => handleSubjectClick(sub.id)}
                                                                        className={`w-full text-start px-3 py-2 rounded-lg text-xs font-bold transition-all mb-1 ${selectedSubject === sub.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                                                      >
                                                                        📖 {sub.name}
                                                                      </button>
                                                                    ))}
                                                                  </div>
                                                                )}
                                                                {subjects.filter(s => s.semester === 2).length > 0 && (
                                                                  <div>
                                                                    <div className="text-[10px] font-bold text-gray-400 mb-1 px-2">الفصل الثاني</div>
                                                                    {subjects.filter(s => s.semester === 2).map(sub => (
                                                                      <button 
                                                                        key={sub.id}
                                                                        onClick={() => handleSubjectClick(sub.id)}
                                                                        className={`w-full text-start px-3 py-2 rounded-lg text-xs font-bold transition-all mb-1 ${selectedSubject === sub.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                                                      >
                                                                        📖 {sub.name}
                                                                      </button>
                                                                    ))}
                                                                  </div>
                                                                )}
                                                            </motion.div>
                                                          )}
                                                        </AnimatePresence>
                                                      </div>
                                                    ))}
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-10 relative z-10">
          
          {/* Main Tabs (Academic vs General) */}
          <div className="flex justify-center mb-10 relative z-20">
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex">
              <button
                onClick={() => setActiveTab('ACADEMIC')}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'ACADEMIC' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <span>🎓</span> المواد الدراسية
              </button>
              <button
                onClick={() => setActiveTab('GENERAL')}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${activeTab === 'GENERAL' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <span>🌍</span> المكتبة العامة
              </button>
            </div>
          </div>

          {/* Mobile Document Type Tabs */}
          <div className="lg:hidden mb-6 overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex space-x-2 rtl:space-x-reverse min-w-max">
              {documentTypes.map(type => (
                <button
                  key={type.id || 'all'}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${selectedType === type.id ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:bg-white'}`}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-10 border border-white/50"
          >
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">🔍 {t('dashboard.search_title') || 'البحث في المراجع'}</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dashboard.search_placeholder') || 'ابحث باسم الملف أو الوصف...'} 
                  className="w-full pr-12 pl-6 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg font-medium text-gray-800"
                />
              </div>
            </div>
          </motion.div>

          {/* Documents Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                {activeTab === 'GENERAL' ? 'المكتبة العامة (كتب ومراجع خارجية)' : (selectedSubject ? 'ملفات المادة المحددة' : (t('dashboard.recent') || 'أحدث الملفات'))}
              </h2>
              {selectedSubject && activeTab === 'ACADEMIC' && (
                <button 
                  onClick={() => {
                    setSelectedSubject(null);
                    fetchDocuments();
                  }}
                  className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  إلغاء الفلتر ✖
                </button>
              )}
            </div>
            
            {loadingDocs ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredDocs.map((doc, index) => (
                    <motion.div 
                      key={doc.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group flex flex-col"
                    >
                      <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 relative p-6 flex flex-col justify-between border-b border-gray-50">
                        <div className="flex justify-between items-start">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                            doc.type === 'BOOK' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            doc.type === 'SUMMARY' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                            doc.type === 'EXAM' ? 'bg-red-50 text-red-700 border-red-100' : 
                            'bg-green-50 text-green-700 border-green-100'
                          }`}>
                            {doc.type === 'BOOK' ? '📚 كتاب' : doc.type === 'SUMMARY' ? '📝 ملخص' : doc.type === 'EXAM' ? '🎯 اختبار' : '🎥 محاضرة'}
                          </span>
                          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1.5 rounded-xl shadow-sm">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          {doc.fileSize && (
                            <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                              {doc.fileSize}
                            </div>
                          )}
                          {doc.reviews && doc.reviews.length > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                              <span>⭐</span>
                              <span>{getAverageRating(doc.reviews)}</span>
                              <span className="text-gray-400 font-medium">({doc.reviews.length})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                          {doc.description || 'لا يوجد وصف متاح لهذا الملف.'}
                        </p>
                        
                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-xs font-extrabold text-indigo-600">
                              {doc.uploader?.name?.charAt(0).toUpperCase() || 'م'}
                            </div>
                            <div className="text-xs font-bold text-gray-600 truncate max-w-[100px]">
                              {doc.uploader?.name || 'مستخدم'}
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              try {
                                const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${doc.fileUrl}`);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = doc.title || 'document';
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                console.error('Download failed', error);
                              }
                            }}
                            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105 cursor-pointer shadow-sm gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            {t('dashboard.download') || 'تحميل'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/50 p-20 text-center"
              >
                <div className="mx-auto h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <span className="text-5xl">📭</span>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">لا توجد ملفات</h3>
                <p className="text-gray-500 text-lg">لم يتم العثور على أي ملفات مطابقة لبحثك أو للقسم المحدد.</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
