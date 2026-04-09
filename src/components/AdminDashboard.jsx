import React, { useState, useEffect } from 'react';
import { Shield, Users, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAllUsers, updateUserRole } from '../api/userApi';
import { eventBus } from '../utils/eventBus';
import { EVENTS } from './GlobalToast';

export default function AdminDashboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setIsUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      eventBus.publish(EVENTS.SHOW_TOAST, { message: 'Rol actualizado exitosamente', type: 'success' });
    } catch (err) {
      eventBus.publish(EVENTS.SHOW_TOAST, { message: err.message || 'No se pudo cambiar el rol', type: 'error' });
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-600" />
            Panel de Administración
          </h2>
          <p className="mt-2 text-lg text-gray-500">
            Control de Acceso por Roles (RBAC)
          </p>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
          title="Recargar lista"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-2 text-gray-700 font-medium">
            <Users className="w-5 h-5" />
            Usuarios Registrados ({users.length})
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Fecha de Creación</th>
                  <th className="px-6 py-4 text-center">Rol (Acceso)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      {user.username}
                      {user.username === currentUser && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full border border-orange-200">Tú</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={isUpdating === user.id || user.username === currentUser}
                        className={`text-sm rounded-lg border px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors
                          ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 font-medium' : 
                            user.role === 'editor' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                          ${isUpdating === user.id ? 'opacity-50 cursor-wait' : ''}
                        `}
                      >
                        <option value="usuario">Usuario Estándar</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
