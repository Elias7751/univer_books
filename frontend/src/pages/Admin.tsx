import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import AcademicManager from '../components/AcademicManager';
import UserManagement from '../components/UserManagement';

const Admin = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchPendingDocs = async () => {
      try {
        const response = await api.get('/documents?status=PENDING');
        setPendingDocs(response.data);
      } catch (error) {
        console.error('Failed to fetch pending documents', error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'pending') {
      fetchPendingDocs();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/admin/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      }
    };
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/admin/logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch logs', error);
      }
    };
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReview = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    let rejectionReason = '';
    if (status === 'REJECTED') {
      const reason = window.prompt('الرجاء إدخال سبب الرفض:');
      if (reason === null) return; // User cancelled
      if (reason.trim() === '') {
        alert('يجب إدخال سبب الرفض');
        return;
      }
      rejectionReason = reason;
    }

    try {
      await api.put(`/documents/${id}/review`, { status, rejectionReason });
      setPendingDocs(pendingDocs.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error reviewing document', error);
      alert('Failed to review document');
    }
  };

  const handleResolveReport = async (id: number, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await api.put(`/admin/reports/${id}/resolve`, { status });
      setReports(reports.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      console.error('Error resolving report', error);
      alert('Failed to resolve report');
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-gray-900 text-white flex flex-col shadow-2xl z-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none"></div>
        
        <div className="h-24 flex items-center justify-between px-8 border-b border-gray-800 relative z-10">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center transform -rotate-6 shadow-lg shadow-primary/50">
              <span className="text-white text-xl">U</span>
            </div>
            {t('admin.title')}
          </h1>
        </div>
        
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-4 mb-8 bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-700/50">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm text-white">{user?.name}</p>
              <p className="text-xs text-indigo-300 font-medium">{user?.role}</p>
            </div>
          </div>

          <nav className="space-y-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'overview' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 transform scale-[1.02]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="flex-1 text-start flex items-center gap-3">
                <span className="text-lg">📊</span>
                نظرة عامة
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={`w-full flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'pending' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 transform scale-[1.02]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="flex-1 text-start flex items-center gap-3">
                <span className="text-lg">📄</span>
                {t('admin.pending')}
              </span>
              {pendingDocs.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                  {pendingDocs.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'reports' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 transform scale-[1.02]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="flex-1 text-start flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                البلاغات
              </span>
              {reports.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="bg-yellow-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                  {reports.filter(r => r.status === 'PENDING').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'logs' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 transform scale-[1.02]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="flex-1 text-start flex items-center gap-3">
                <span className="text-lg">🛡️</span>
                سجل النشاطات
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('universities')}
              className={`w-full flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'universities' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 transform scale-[1.02]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="flex-1 text-start flex items-center gap-3">
                <span className="text-lg">🏛️</span>
                {t('admin.universities')}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === 'users' ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 transform scale-[1.02]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="flex-1 text-start flex items-center gap-3">
                <span className="text-lg">👥</span>
                {t('admin.users')}
              </span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-800 space-y-4 relative z-10 bg-gray-900/80 backdrop-blur-md">
          <button
            onClick={toggleLanguage}
            className="w-full flex justify-center py-3.5 px-4 border border-gray-700 rounded-xl text-sm font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            {i18n.language === 'ar' ? '🌐 English' : '🌐 العربية'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-red-500/20"
          >
            🚪 {t('dashboard.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full bg-gray-50/50 relative">
        {/* Decorative background for main content */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-10">
          
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  نظرة عامة (الإحصائيات)
                </h2>
                <p className="mt-2 text-sm text-gray-500">إحصائيات عامة عن المنصة والمستخدمين والملفات.</p>
              </div>

              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-2xl">👥</div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold">إجمالي المستخدمين</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalUsers}</h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center text-2xl">📚</div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold">إجمالي الملفات</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalDocuments}</h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-2xl">✅</div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold">الملفات المعتمدة</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{stats.approvedDocuments}</h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-xl flex items-center justify-center text-2xl">⏳</div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold">الملفات المعلقة</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{stats.pendingDocuments}</h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center text-2xl">🏛️</div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold">الجامعات المسجلة</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalUniversities}</h3>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center text-2xl">🏫</div>
                    <div>
                      <p className="text-sm text-gray-500 font-bold">الكليات المسجلة</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalColleges}</h3>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  البلاغات والشكاوى
                </h2>
                <p className="mt-2 text-sm text-gray-500">مراجعة بلاغات الطلاب حول الملفات الخاطئة أو التي لا تعمل.</p>
              </div>

              <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden">
                {reports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الملف</th>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">السبب</th>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">المُبلّغ</th>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                          <th scope="col" className="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {reports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{report.document?.title}</div>
                              <a href={`http://localhost:5000${report.document?.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">عرض الملف</a>
                            </td>
                            <td className="px-6 py-5 text-sm text-gray-600 font-medium max-w-xs truncate">
                              {report.reason}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                              {report.reporter?.name}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {report.status === 'PENDING' ? 'قيد المراجعة' : report.status === 'RESOLVED' ? 'تم الحل' : 'مرفوض'}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-end text-sm font-medium">
                              {report.status === 'PENDING' && (
                                <>
                                  <button 
                                    onClick={() => handleResolveReport(report.id, 'RESOLVED')}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors mr-2 rtl:ml-2 rtl:mr-0"
                                  >
                                    حل المشكلة
                                  </button>
                                  <button 
                                    onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                  >
                                    تجاهل
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">🎉</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">لا توجد بلاغات</h3>
                    <p className="mt-2 text-gray-500">كل شيء يسير على ما يرام!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  سجل النشاطات (Audit Logs)
                </h2>
                <p className="mt-2 text-sm text-gray-500">مراقبة جميع الحركات التي تحدث في المنصة.</p>
              </div>

              <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden p-6">
                {logs.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {logs.map((log) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-50 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-gray-900">{log.user?.name || 'النظام'} <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{log.user?.role || 'SYSTEM'}</span></div>
                            <time className="text-xs font-medium text-indigo-500">{new Date(log.createdAt).toLocaleString('ar-SA')}</time>
                          </div>
                          <div className="text-sm text-gray-600 font-medium">{log.action}</div>
                          <div className="text-xs text-gray-500 mt-1">{log.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">لا توجد نشاطات مسجلة بعد.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {t('admin.pending')}
                </h2>
                <p className="mt-2 text-sm text-gray-500">Review and approve documents uploaded by representatives.</p>
              </div>

              <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : pendingDocs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">Uploader</th>
                          <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {pendingDocs.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-primary">
                                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="ms-4">
                                  <div className="text-sm font-bold text-gray-900">{doc.title}</div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-indigo-700 font-medium transition-colors">View File</a>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800">
                                {doc.type}
                              </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                              {doc.uploader?.name}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-end text-sm font-medium">
                              <button 
                                onClick={() => handleReview(doc.id, 'APPROVED')}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors mr-2 rtl:ml-2 rtl:mr-0"
                              >
                                {t('admin.approve')}
                              </button>
                              <button 
                                onClick={() => handleReview(doc.id, 'REJECTED')}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              >
                                {t('admin.reject')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t('admin.no_pending')}</h3>
                    <p className="mt-2 text-gray-500">{t('admin.no_pending_desc')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'universities' && (
            <div className="animate-fade-in">
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {t('admin.universities')}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">Manage academic structure (Universities, Colleges, Departments, etc.)</p>
                </div>
              </div>
              
              <AcademicManager />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {t('admin.users')}
                </h2>
                <p className="mt-2 text-sm text-gray-500">Manage platform users and roles.</p>
              </div>
              <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden">
                <UserManagement />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Admin;
