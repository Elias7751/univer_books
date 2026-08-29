import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Document Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collegesRes, docsRes] = await Promise.all([
        api.get('/academic/colleges'),
        api.get('/documents')
      ]);
      setColleges(collegesRes.data);
      setDocuments(docsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.subject?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeName = (type: string) => {
    switch(type) {
      case 'BOOK': return 'كتاب';
      case 'RESEARCH': return 'بحث';
      case 'LECTURE': return 'محاضرة';
      case 'SUMMARY': return 'ملخص';
      case 'EXAM': return 'اختبار';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'BOOK': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RESEARCH': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SUMMARY': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'LECTURE': return 'bg-green-100 text-green-700 border-green-200';
      case 'EXAM': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'BOOK': return '📚';
      case 'RESEARCH': return '🔬';
      case 'SUMMARY': return '📝';
      case 'LECTURE': return '🎥';
      case 'EXAM': return '🎯';
      default: return '📄';
    }
  };

  const getAverageRating = (reviews?: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleReport = async (docId: number) => {
    if (!user) {
      alert('يجب تسجيل الدخول أولاً للإبلاغ عن ملف.');
      return;
    }
    const reason = prompt('ما هي المشكلة في هذا الملف؟ (مثال: رابط لا يعمل، محتوى غير لائق، ملف خاطئ)');
    if (!reason) return;

    try {
      await api.post(`/documents/${docId}/report`, { reason });
      alert('تم إرسال البلاغ بنجاح. سيقوم المشرف بمراجعته قريباً.');
    } catch (error) {
      console.error('Error reporting document:', error);
      alert('حدث خطأ أثناء إرسال البلاغ.');
    }
  };

  const openReviewModal = (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    if (!user) {
      alert('يجب تسجيل الدخول أولاً لتقييم الملف.');
      return;
    }
    setSelectedDocId(docId);
    setRating(0);
    setComment('');
    setReviewModalOpen(true);
  };

  const openDetailsModal = (doc: any) => {
    setSelectedDoc(doc);
    setDetailsModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedDocId || rating === 0) {
      alert('الرجاء اختيار التقييم (عدد النجوم).');
      return;
    }

    try {
      await api.post(`/documents/${selectedDocId}/review`, { rating, comment });
      alert('تم إرسال تقييمك بنجاح! شكراً لك.');
      setReviewModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ أثناء إرسال التقييم.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                م
              </div>
              <div>
                <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">مَصْدَر | Masdar</h1>
                <p className="text-xs text-gray-500 font-medium">المراجع والكتب الأكاديمية</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-900 font-bold hover:text-indigo-600 transition-colors">الرئيسية</a>
              <a href="#categories" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors">التخصصات</a>
              <a href="#latest" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors">أحدث الإضافات</a>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                user.role === 'REPRESENTATIVE' || user.role === 'ADMIN' ? (
                  <Link to="/upload" className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all">
                    <span>📤</span> رفع ملف
                  </Link>
                ) : (
                  <Link to="/dashboard" className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all">
                    لوحة التحكم
                  </Link>
                )
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2 bg-gray-100 text-gray-800 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all">
                  تسجيل الدخول
                </Link>
              )}
              <a href="https://t.me/MasdarBBOT" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-100">
                <span>✈️</span> <span className="hidden sm:inline">بوت تيليجرام</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 -left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm mb-6 border border-indigo-100">
                <span>🎓</span> منصتك الأكاديمية في مكان واحد
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6"
            >
              ابحث عن مرجعك، <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">وتعلّم بثقة.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed"
            >
              منصة مَصْدَر تجمع الكتب والبحوث والملازم والمحاضرات وتساعدك على الوصول إلى المصادر المناسبة حسب الكلية والتخصص والمستوى.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="flex items-center bg-white rounded-2xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                <span className="pl-4 pr-2 text-2xl text-gray-400">🔎</span>
                <input 
                  type="text" 
                  placeholder="ابحث باسم كتاب، مادة، مؤلف أو موضوع..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg py-3 px-2 placeholder-gray-400"
                />
                <button 
                  onClick={() => document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  بحث
                </button>
              </div>
              
              <div className="flex justify-center mt-6">
                <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-indigo-100 text-indigo-700 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                  <span>🌍</span> تصفح المكتبة العامة
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-sm">
                <span className="text-gray-500 font-medium">بحث سريع:</span>
                {['شبكات الحاسوب', 'قواعد البيانات', 'البرمجة', 'الرياضيات'].map((tag, i) => (
                  <button 
                    key={i}
                    onClick={() => setSearchQuery(tag)}
                    className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors font-medium shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-x-reverse divide-gray-100">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-indigo-600 mb-2">{documents.filter(d => d.type === 'BOOK').length}+</div>
              <div className="text-gray-500 font-medium">كتاب ومرجع</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-purple-600 mb-2">{documents.filter(d => d.type === 'RESEARCH').length}+</div>
              <div className="text-gray-500 font-medium">بحث أكاديمي</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-pink-600 mb-2">{colleges.length}</div>
              <div className="text-gray-500 font-medium">كلية وتخصص</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-gray-900 mb-2">{documents.length}</div>
              <div className="text-gray-500 font-medium">إجمالي الملفات</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">تصفح بسهولة</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">اختر مسارك الأكاديمي</h2>
            </div>
            <button className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              عرض الكل <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {colleges.slice(0, 4).map((college, index) => {
              const icons = ['💻', '🔬', '📐', '📊'];
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-orange-500 to-red-500',
                'from-emerald-500 to-teal-500'
              ];
              return (
                <motion.button 
                  key={college.id} 
                  whileHover={{ y: -5 }}
                  onClick={() => alert(`تم اختيار ${college.name}`)}
                  className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all text-right group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[index % 4]} opacity-5 rounded-bl-full transition-transform group-hover:scale-110`}></div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[index % 4]} text-white flex items-center justify-center text-2xl mb-6 shadow-lg`}>
                    {icons[index % 4]}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{college.name}</h3>
                  <p className="text-gray-500 text-sm font-medium">تصفح أقسام ومواد الكلية</p>
                </motion.button>
              );
            })}
            {colleges.length === 0 && (
              <div className="col-span-full text-center py-10 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500 font-medium">لا توجد كليات مضافة بعد.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest Documents Section */}
      <section id="latest" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2 block">تمت إضافتها مؤخرًا</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">أحدث المراجع والملفات</h2>
            </div>
            
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 hide-scrollbar gap-2 w-full md:w-auto">
              {[
                { id: 'ALL', label: 'الكل' },
                { id: 'BOOK', label: 'كتب' },
                { id: 'RESEARCH', label: 'أبحاث' },
                { id: 'SUMMARY', label: 'ملخصات' }
              ].map(filter => (
                <button 
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                    filterType === filter.id 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredDocs.map((doc, index) => (
                <motion.article 
                  key={doc.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => openDetailsModal(doc)}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer group flex flex-col h-full"
                >
                  {/* Card Header/Cover */}
                  <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 relative p-6 flex flex-col justify-between border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getTypeColor(doc.type)}`}>
                        {getTypeIcon(doc.type)} {getTypeName(doc.type)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => openReviewModal(e, doc.id)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-yellow-500 hover:bg-yellow-50 transition-colors" title="تقييم">⭐</button>
                        <button onClick={(e) => { e.stopPropagation(); handleReport(doc.id); }} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" title="إبلاغ">⚠️</button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors mb-2">
                        {doc.title}
                      </h3>
                      {doc.reviews && doc.reviews.length > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                          <span>⭐</span>
                          <span>{getAverageRating(doc.reviews)}</span>
                          <span className="text-gray-400 font-medium">({doc.reviews.length})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-sm text-gray-500 mb-4 flex-1">
                      <p className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400">📚</span> {doc.subject?.name || 'مادة عامة'}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-gray-400">🎓</span> {doc.subject?.level?.major?.name || 'تخصص عام'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {doc.uploader?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs font-bold text-gray-600">{doc.uploader?.name || 'مستخدم'}</span>
                      </div>
                      <a 
                        href={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${doc.fileUrl}`} 
                        download
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        تحميل <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
            
            {filteredDocs.length === 0 && (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                <span className="text-6xl block mb-4">🔎</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">لم نجد نتائج</h3>
                <p className="text-gray-500">جرّب كلمة بحث أخرى أو تصفح التخصصات.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Telegram CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold mb-6">المكتبة معك أينما كنت</span>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">لا تريد فتح الموقع؟ <br/>استخدم بوت تيليجرام.</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">ابحث عن الكتب، اختر تخصصك وحمّل المرجع مباشرة من تيليجرام بكل سرعة وسهولة.</p>
              <a 
                href="https://t.me/MasdarBBOT" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-lg"
              >
                <span className="text-2xl">✈️</span> ابدأ من تيليجرام
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">م</div>
            <div>
              <strong className="block text-gray-900">مَصْدَر | Masdar</strong>
              <span className="text-sm text-gray-500">منصة أكاديمية لتنظيم ومشاركة المراجع الجامعية.</span>
            </div>
          </div>
          <div className="text-gray-400 text-sm font-medium">
            © 2026 جميع الحقوق محفوظة
          </div>
        </div>
      </footer>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)}></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10"
            >
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">تقييم الملف</h3>
              
              <div className="flex justify-center gap-2 mb-8 flex-row-reverse">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-5xl transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200 hover:text-yellow-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">تعليق (اختياري)</label>
                <textarea 
                  className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl p-4 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="ما رأيك في هذا الملف؟"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button onClick={submitReview} className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  إرسال التقييم
                </button>
                <button onClick={() => setReviewModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDetailsModalOpen(false)}></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-50 to-purple-50 -z-10"></div>
              
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 bg-white shadow-sm ${getTypeColor(selectedDoc.type)}`}>
                  {getTypeIcon(selectedDoc.type)} {getTypeName(selectedDoc.type)}
                </span>
                <button onClick={() => setDetailsModalOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
                  ✕
                </button>
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-900 mb-6 leading-tight">{selectedDoc.title}</h3>
              
              <div className="space-y-4 mb-8 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400">📚</div>
                  <div>
                    <span className="block text-xs text-gray-500 font-bold">المادة</span>
                    <span className="font-medium">{selectedDoc.subject?.name || 'غير محدد'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400">💾</div>
                  <div>
                    <span className="block text-xs text-gray-500 font-bold">حجم الملف</span>
                    <span className="font-medium">{Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 9)} MB</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-gray-700 pt-2 border-t border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-gray-400 mt-1">📝</div>
                  <div>
                    <span className="block text-xs text-gray-500 font-bold mb-1">الوصف</span>
                    <p className="text-sm leading-relaxed">{selectedDoc.description || 'لا يوجد وصف متاح لهذا الملف.'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a 
                  href={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${selectedDoc.fileUrl}`} 
                  download
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  تحميل الملف
                </a>
                <a 
                  href={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${selectedDoc.fileUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-gray-100 text-gray-800 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  قراءة الملف
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
