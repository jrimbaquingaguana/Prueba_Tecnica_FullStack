// src/pages/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SidebarLayout from './SidebarLayout';
import { FaTrash, FaEdit } from 'react-icons/fa';

export default function ManageUsers() {
  const theme = useSelector(state => state.theme.mode);
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const borderColor = theme === 'dark' ? '#555' : '#ccc';

  // Colores de botones según tema
  const btnEditColor = theme === 'dark' ? 'transparente' : 'transparente';
  const btnDeleteColor = theme === 'dark' ? '#ef4444' : '#e871acff';
  const btnModalDeleteColor = theme === 'dark' ? '#ef4444' : '#e871acff';

  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'tecnico',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const apiBase = 'http://localhost:3000/users';

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiBase);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ========================
  // Crear o editar usuario
  // ========================
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', email: '', role: 'tecnico' });
    setModalMessage('');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', name: user.name, email: user.email, role: user.role });
    setModalMessage('');
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!formData.username || (!editingUser && !formData.password) || !formData.name || !formData.email) {
        setModalMessage('Todos los campos son obligatorios');
        return;
      }
      if (!['tecnico', 'admin'].includes(formData.role)) {
        setModalMessage('Rol inválido');
        return;
      }

      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `${apiBase}/${editingUser.id}` : apiBase;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        let errorMsg = 'Error desconocido';
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) errorMsg = errorData.message;
        } catch {}
        throw new Error(errorMsg);
      }

      await fetchUsers();
      setShowModal(false);
    } catch (err) {
      console.error('Error guardando usuario:', err.message);
      setModalMessage(err.message);
    }
  };

  // ========================
  // Borrar usuario
  // ========================
  const handleDeleteUserModal = (id) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await fetch(`${apiBase}/${deleteUserId}`, { method: 'DELETE' });
      fetchUsers();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      setShowDeleteModal(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================
  // Render
  // ========================
  return (
    <SidebarLayout>
      <div style={{ minHeight: '100vh', padding: 10, color: textColor }}>
        {/* Header y Buscar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h2>Gestión de Usuarios</h2>
          <button
            onClick={handleAddUser}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: theme === 'dark' ? '#2563eb' : '#e871acff',
              color: '#fff',
            }}
          >
            Crear Usuario
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: `1px solid ${borderColor}`,
            width: 250,
            backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff',
            color: textColor,
            marginBottom: 10,
          }}
        />

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: textColor, border: `1px solid ${borderColor}` }}>
            <thead>
              <tr>
                <th style={{ padding: 10, border: `1px solid ${borderColor}` }}>ID</th>
                <th style={{ padding: 10, border: `1px solid ${borderColor}` }}>Usuario</th>
                <th style={{ padding: 10, border: `1px solid ${borderColor}` }}>Nombre</th>
                <th style={{ padding: 10, border: `1px solid ${borderColor}` }}>Email</th>
                <th style={{ padding: 10, border: `1px solid ${borderColor}` }}>Rol</th>
                <th style={{ padding: 10, border: `1px solid ${borderColor}` }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: 10, border: `1px solid ${borderColor}` }}>{user.id}</td>
                  <td style={{ padding: 10, border: `1px solid ${borderColor}` }}>{user.username}</td>
                  <td style={{ padding: 10, border: `1px solid ${borderColor}` }}>{user.name}</td>
                  <td style={{ padding: 10, border: `1px solid ${borderColor}` }}>{user.email}</td>
                  <td style={{ padding: 10, border: `1px solid ${borderColor}` }}>{user.role}</td>
                  <td style={{ padding: 10, border: `1px solid ${borderColor}` }}>
                    <button
                      onClick={() => handleEditUser(user)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        backgroundColor: btnEditColor,
                        color: '#fff',
                        cursor: 'pointer',
                        marginRight: 5,
                      }}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUserModal(user.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        backgroundColor: btnDeleteColor,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Crear/Editar */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}>
            <div style={{ color: textColor, borderRadius: 10, padding: 20, minWidth: 300, backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff' }}>
              <h3>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <input type="text" placeholder="Usuario" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff', color: textColor }} />
                {!editingUser && <input type="password" placeholder="Contraseña" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff', color: textColor }} />}
                <input type="text" placeholder="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff', color: textColor }} />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff', color: textColor }} />
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', backgroundColor: theme === 'dark' ? '#3a3a3a' : '#fff', color: textColor }}>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Admin</option>
                </select>
                {modalMessage && <div style={{ color: '#ef4444', fontSize: 14 }}>{modalMessage}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 10 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    backgroundColor: 'transparent', // ✅ correcto
                    color: theme === 'dark' ? '#fff' : '#000', 
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button onClick={handleSaveUser} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: theme === 'dark' ? '#2563eb' : '#e871acff',  color: '#fff', cursor: 'pointer' }}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}>
            <div style={{ color: textColor, borderRadius: 10, padding: 20, minWidth: 300, backgroundColor: theme === 'dark' ? '#2c2c2c' : '#fff' }}>
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de eliminar este usuario?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: 'transparent',             borderColor: theme === 'dark' ? '#fff' : '#000', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleConfirmDelete} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', backgroundColor: btnModalDeleteColor, color: '#fff', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </SidebarLayout>
  );
}
