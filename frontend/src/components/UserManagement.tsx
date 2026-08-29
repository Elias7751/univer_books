import { useState, useEffect } from 'react';
import api from '../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!window.confirm(`هل أنت متأكد أنك تريد ${currentStatus ? 'حظر' : 'تفعيل'} هذا المستخدم؟`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم</th>
            <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الهاتف</th>
            <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الصلاحية</th>
            <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
            <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ الانضمام</th>
            <th scope="col" className="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">إجراءات</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm text-gray-500" dir="ltr">{user.phone}</div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                  user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user.role === 'REPRESENTATIVE' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'REPRESENTATIVE' ? 'مندوب' : user.role === 'STUDENT' ? 'طالب' : user.role}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                  user.isActive === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.isActive === false ? 'محظور' : 'نشط'}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('ar-SA')}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-end text-sm font-medium flex items-center justify-end gap-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="block w-32 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-xs bg-white"
                >
                  <option value="STUDENT">طالب</option>
                  <option value="REPRESENTATIVE">مندوب</option>
                  <option value="ADMIN">مدير</option>
                </select>
                
                <button
                  onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors ${
                    user.isActive === false ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {user.isActive === false ? 'تفعيل' : 'حظر'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
