import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

interface FileUploadData {
  file: File;
  title: string;
  type: string;
  subjectId: string;
}

const UploadDocument = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Academic structure states for dropdowns
  const [universities, setUniversities] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Files state
  const [filesData, setFilesData] = useState<FileUploadData[]>([]);
  const [isGeneral, setIsGeneral] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'REPRESENTATIVE' && user.role !== 'ADMIN')) {
      navigate('/');
    }
    fetchUniversities();
  }, [user, navigate]);

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/academic/universities');
      setUniversities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUniversityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uniId = e.target.value;
    setColleges([]); setDepartments([]); setMajors([]); setLevels([]); setSubjects([]);
    if (!uniId) return;
    try {
      const res = await api.get(`/academic/colleges?universityId=${uniId}`);
      setColleges(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollegeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const colId = e.target.value;
    setDepartments([]); setMajors([]); setLevels([]); setSubjects([]);
    if (!colId) return;
    try {
      const res = await api.get(`/academic/departments?collegeId=${colId}`);
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    setMajors([]); setLevels([]); setSubjects([]);
    if (!deptId) return;
    try {
      const res = await api.get(`/academic/majors?departmentId=${deptId}`);
      setMajors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMajorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const majorId = e.target.value;
    setLevels([]); setSubjects([]);
    if (!majorId) return;
    try {
      const res = await api.get(`/academic/levels?majorId=${majorId}`);
      setLevels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLevelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const levelId = e.target.value;
    setSubjects([]);
    if (!levelId) return;
    try {
      const res = await api.get(`/academic/subjects?levelId=${levelId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      title: file.name.split('.')[0],
      type: 'BOOK',
      subjectId: ''
    }));
    setFilesData(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  const updateFileData = (index: number, field: keyof FileUploadData, value: string) => {
    setFilesData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const removeFile = (index: number) => {
    setFilesData(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (filesData.length === 0) {
      setError('الرجاء اختيار ملف واحد على الأقل للرفع');
      return;
    }

    // Validate all files have subjects if not general
    if (!isGeneral) {
      const missingSubject = filesData.some(f => !f.subjectId);
      if (missingSubject) {
        setError('الرجاء اختيار المادة الدراسية لكل الملفات المرفوعة');
        return;
      }
    }

    setLoading(true);

    try {
      // Upload files sequentially or in parallel
      for (const fileData of filesData) {
        const formData = new FormData();
        formData.append('title', fileData.title);
        formData.append('type', fileData.type);
        if (!isGeneral) {
          formData.append('subjectId', fileData.subjectId);
        } else {
          formData.append('isGeneral', 'true');
        }
        formData.append('file', fileData.file);

        await api.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(`تم رفع ${filesData.length} ملف بنجاح! بانتظار موافقة الإدارة.`);
      setFilesData([]);
      // Reset file input visually
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء رفع الملفات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-5xl mx-auto relative z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">
          
          {/* Header Section */}
          <div className="relative px-10 py-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-10"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 flex items-center gap-4"
                >
                  <span className="text-4xl filter drop-shadow-sm">✨</span>
                  مركز رفع الملفات
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 text-gray-600 font-medium text-lg"
                >
                  شارك معرفتك وارفع ملفاتك الدراسية بكل سهولة وأناقة
                </motion.p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')} 
                className="group flex items-center gap-2 bg-white/80 hover:bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all border border-indigo-100"
              >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                العودة للرئيسية
              </motion.button>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                  <div className="bg-red-50/80 backdrop-blur-sm border-r-4 border-red-500 p-5 rounded-2xl flex items-center gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <p className="text-red-700 font-bold">{error}</p>
                  </div>
                </motion.div>
              )}
              
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                  <div className="bg-green-50/80 backdrop-blur-sm border-r-4 border-green-500 p-5 rounded-2xl flex items-center gap-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <p className="text-green-700 font-bold">{success}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Toggle General vs Academic */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex">
                  <button
                    type="button"
                    onClick={() => setIsGeneral(false)}
                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${!isGeneral ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                  >
                    <span>🎓</span> ملف أكاديمي
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGeneral(true)}
                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${isGeneral ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                  >
                    <span>🌍</span> مرجع عام
                  </button>
                </div>
              </div>

              {/* Step 1: Academic Structure */}
              {!isGeneral && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  تحديد المسار الأكاديمي
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
                  {[
                    { label: 'الجامعة', options: universities, onChange: handleUniversityChange, disabled: false },
                    { label: 'الكلية', options: colleges, onChange: handleCollegeChange, disabled: colleges.length === 0 },
                    { label: 'القسم', options: departments, onChange: handleDepartmentChange, disabled: departments.length === 0 },
                    { label: 'التخصص', options: majors, onChange: handleMajorChange, disabled: majors.length === 0 },
                    { label: 'المستوى', options: levels, onChange: handleLevelChange, disabled: levels.length === 0 }
                  ].map((field, idx) => (
                    <div key={idx} className="relative group">
                      <select 
                        onChange={field.onChange} 
                        disabled={field.disabled}
                        className="w-full px-5 py-4 bg-white/50 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-indigo-500 outline-none disabled:bg-gray-50/50 disabled:cursor-not-allowed transition-all hover:border-indigo-200 appearance-none font-medium text-gray-700"
                      >
                        <option value="">اختر {field.label}...</option>
                        {field.options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                      </select>
                      <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              )}

              {/* Step 2: Dropzone */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="bg-purple-100 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  رفع الملفات
                </h3>
                
                <div 
                  {...getRootProps()} 
                  className={`relative overflow-hidden group mt-2 flex flex-col items-center justify-center px-6 py-16 border-4 border-dashed rounded-[2rem] transition-all duration-300 cursor-pointer ${
                    isDragActive ? 'border-indigo-500 bg-indigo-50/50 shadow-inner' : 'border-gray-200 hover:border-indigo-400 bg-white/40 hover:bg-white/60'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {/* Animated Background Blob for Dropzone */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 transition-opacity duration-500 ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                  <motion.div 
                    animate={{ y: isDragActive ? -15 : 0, scale: isDragActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative z-10"
                  >
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${isDragActive ? 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-200' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                      <svg className="w-12 h-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </motion.div>
                  
                  <div className="relative z-10 text-center space-y-2">
                    <p className="text-xl font-bold text-gray-700">
                      {isDragActive ? 'أفلت الملفات الآن...' : 'اسحب وأفلت الملفات هنا'}
                    </p>
                    <p className="text-gray-500 font-medium">أو انقر لاختيار الملفات من جهازك</p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span className="px-3 py-1 bg-gray-100 rounded-full">PDF</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-full">PNG</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-full">JPG</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3: Files List */}
              <AnimatePresence>
                {filesData.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-orange-400 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="bg-pink-100 text-pink-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                      تفاصيل الملفات <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filesData.length} ملف</span>
                    </h3>
                    
                    <div className="space-y-5">
                      <AnimatePresence>
                        {filesData.map((fileData, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
                          >
                            <button 
                              type="button" 
                              onClick={() => removeFile(index)}
                              className="absolute top-6 left-6 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                              title="إزالة الملف"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            
                            <div className="flex items-center gap-4 mb-6 pr-2">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 text-lg truncate max-w-[200px] sm:max-w-xs">{fileData.file.name}</h4>
                                <span className="text-sm font-medium text-gray-400">{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">عنوان الملف</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={fileData.title}
                                  onChange={(e) => updateFileData(index, 'title', e.target.value)}
                                  className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-indigo-500 rounded-xl outline-none text-gray-700 font-medium transition-all"
                                  placeholder="أدخل عنواناً واضحاً..."
                                />
                              </div>

                              {!isGeneral && (
                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">المادة الدراسية <span className="text-red-500">*</span></label>
                                <div className="relative">
                                  <select 
                                    value={fileData.subjectId} 
                                    onChange={(e) => updateFileData(index, 'subjectId', e.target.value)} 
                                    disabled={subjects.length === 0} 
                                    required={!isGeneral}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-indigo-500 rounded-xl outline-none text-gray-700 font-medium transition-all appearance-none disabled:opacity-50"
                                  >
                                    <option value="">اختر المادة...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (الفصل {s.semester === 1 ? 'الأول' : 'الثاني'})</option>)}
                                  </select>
                                  <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                  </div>
                                </div>
                              </div>
                              )}

                              <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">نوع الملف</label>
                                <div className="relative">
                                  <select 
                                    value={fileData.type}
                                    onChange={(e) => updateFileData(index, 'type', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-indigo-500 rounded-xl outline-none text-gray-700 font-medium transition-all appearance-none"
                                  >
                                    <option value="BOOK">كتاب</option>
                                    <option value="SUMMARY">ملخص</option>
                                    <option value="EXAM">نموذج اختبار</option>
                                    <option value="LECTURE">محاضرة</option>
                                  </select>
                                  <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="pt-8"
              >
                <motion.button 
                  whileHover={!loading && filesData.length > 0 ? { scale: 1.02, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.4)" } : {}}
                  whileTap={!loading && filesData.length > 0 ? { scale: 0.98 } : {}}
                  type="submit" 
                  disabled={loading || filesData.length === 0}
                  className={`relative w-full py-5 px-6 rounded-2xl text-white font-bold text-xl overflow-hidden transition-all ${
                    loading || filesData.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl shadow-indigo-200'
                  }`}
                >
                  {/* Button Shine Effect */}
                  {!loading && filesData.length > 0 && (
                    <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  )}
                  
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        {`رفع ${filesData.length > 0 ? filesData.length + ' ملفات' : 'الملفات'}`}
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadDocument;
