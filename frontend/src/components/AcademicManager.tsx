import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

const AcademicManager = () => {
  const { t } = useTranslation();
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newUniName, setNewUniName] = useState('');
  
  const [selectedUni, setSelectedUni] = useState<number | null>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const [newCollegeName, setNewCollegeName] = useState('');

  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDeptName, setNewDeptName] = useState('');

  const [selectedDept, setSelectedDept] = useState<number | null>(null);

  const [levels, setLevels] = useState<any[]>([]);
  const [newLevelName, setNewLevelName] = useState('');

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');

  const fetchUniversities = async () => {
    try {
      const res = await api.get('/academic/universities');
      setUniversities(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName) return;
    try {
      await api.post('/academic/universities', { name: newUniName });
      setNewUniName('');
      fetchUniversities();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchColleges = async (uniId: number) => {
    try {
      const res = await api.get(`/academic/colleges?universityId=${uniId}`);
      setColleges(res.data);
      setSelectedUni(uniId);
      setSelectedCollege(null);
      setSelectedDept(null);
      setSelectedLevel(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName || !selectedUni) return;
    try {
      await api.post('/academic/colleges', { name: newCollegeName, universityId: selectedUni });
      setNewCollegeName('');
      fetchColleges(selectedUni);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDepartments = async (collegeId: number) => {
    try {
      const res = await api.get(`/academic/departments?collegeId=${collegeId}`);
      setDepartments(res.data);
      setSelectedCollege(collegeId);
      setSelectedDept(null);
      setSelectedLevel(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !selectedCollege) return;
    try {
      await api.post('/academic/departments', { name: newDeptName, collegeId: selectedCollege });
      setNewDeptName('');
      fetchDepartments(selectedCollege);
    } catch (error) {
      console.error(error);
    }
  };



  const fetchLevels = async (deptId: number) => {
    try {
      const res = await api.get(`/academic/levels?departmentId=${deptId}`);
      setLevels(res.data);
      setSelectedDept(deptId);
      setSelectedLevel(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevelName || !selectedDept) return;
    try {
      await api.post('/academic/levels', { name: newLevelName, departmentId: selectedDept });
      setNewLevelName('');
      fetchLevels(selectedDept);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async (levelId: number) => {
    try {
      const res = await api.get(`/academic/subjects?levelId=${levelId}`);
      setSubjects(res.data);
      setSelectedLevel(levelId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !selectedLevel) return;
    try {
      await api.post('/academic/subjects', { name: newSubjectName, levelId: selectedLevel });
      setNewSubjectName('');
      fetchSubjects(selectedLevel);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Universities Section */}
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">🏛️</span>
          {t('academic.universities')}
        </h3>
        <form onSubmit={handleAddUniversity} className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={newUniName} 
            onChange={(e) => setNewUniName(e.target.value)} 
            placeholder={t('academic.new_uni')} 
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30">
            {t('academic.add')}
          </button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {universities.map(uni => (
            <div 
              key={uni.id} 
              onClick={() => fetchColleges(uni.id)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:-translate-y-1 ${selectedUni === uni.id ? 'border-primary bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-primary hover:shadow-sm'}`}
            >
              <h4 className="font-bold text-gray-900">{uni.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Colleges Section */}
      {selectedUni && (
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">🏢</span>
            {t('academic.colleges')}
          </h3>
          <form onSubmit={handleAddCollege} className="flex gap-4 mb-8">
            <input 
              type="text" 
              value={newCollegeName} 
              onChange={(e) => setNewCollegeName(e.target.value)} 
              placeholder={t('academic.new_college')} 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30">
              {t('academic.add')}
            </button>
          </form>
          {colleges.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">{t('academic.no_colleges')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {colleges.map(college => (
                <div 
                  key={college.id} 
                  onClick={() => fetchDepartments(college.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:-translate-y-1 ${selectedCollege === college.id ? 'border-primary bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-primary hover:shadow-sm'}`}
                >
                  <h4 className="font-bold text-gray-900">{college.name}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Departments Section */}
      {selectedCollege && (
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">📚</span>
            {t('academic.departments')}
          </h3>
          <form onSubmit={handleAddDepartment} className="flex gap-4 mb-8">
            <input 
              type="text" 
              value={newDeptName} 
              onChange={(e) => setNewDeptName(e.target.value)} 
              placeholder={t('academic.new_dept')} 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30">
              {t('academic.add')}
            </button>
          </form>
          {departments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">{t('academic.no_depts')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div 
                  key={dept.id} 
                  onClick={() => fetchLevels(dept.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:-translate-y-1 ${selectedDept === dept.id ? 'border-primary bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-primary hover:shadow-sm'}`}
                >
                  <h4 className="font-bold text-gray-900">{dept.name}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Levels Section */}
      {selectedDept && (
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">📈</span>
            المستويات
          </h3>
          <form onSubmit={handleAddLevel} className="flex gap-4 mb-8">
            <input 
              type="text" 
              value={newLevelName} 
              onChange={(e) => setNewLevelName(e.target.value)} 
              placeholder="اسم المستوى الجديد (مثال: المستوى الأول)" 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30">
              {t('academic.add')}
            </button>
          </form>
          {levels.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">لا توجد مستويات. قم بإضافة واحد بالأعلى.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {levels.map(level => (
                <div 
                  key={level.id} 
                  onClick={() => fetchSubjects(level.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all transform hover:-translate-y-1 ${selectedLevel === level.id ? 'border-primary bg-indigo-50 shadow-md' : 'border-gray-100 hover:border-primary hover:shadow-sm'}`}
                >
                  <h4 className="font-bold text-gray-900">{level.name}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subjects Section */}
      {selectedLevel && (
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">📖</span>
            المواد الدراسية
          </h3>
          <form onSubmit={handleAddSubject} className="flex gap-4 mb-8">
            <input 
              type="text" 
              value={newSubjectName} 
              onChange={(e) => setNewSubjectName(e.target.value)} 
              placeholder="اسم المادة الجديدة" 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/30">
              {t('academic.add')}
            </button>
          </form>
          {subjects.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-xl">لا توجد مواد. قم بإضافة واحدة بالأعلى.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <div key={subject.id} className="p-5 rounded-xl border-2 border-gray-100 bg-gray-50">
                  <h4 className="font-bold text-gray-900">{subject.name}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicManager;
