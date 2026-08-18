import React, { useState, useEffect } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { getUsers, saveUsers, deleteUser, addUser } from '../services/storage';
import { ImportUsersModal } from './ImportUsersModal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Search,
  Filter,
  Users,
  KeyRound,
  GraduationCap,
  Trash2,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  users?: User[];
  onShowToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, users: propsUsers, onShowToast }) => {
  const [users, setUsers] = useState<User[]>(propsUsers && propsUsers.length > 0 ? propsUsers : getUsers());

  useEffect(() => {
    if (propsUsers && propsUsers.length > 0) {
      setUsers(propsUsers);
    }
  }, [propsUsers]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Reset Password State
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);

  // Add User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('student');
  const [addClass, setAddClass] = useState('');
  const [addNisNip, setAddNisNip] = useState('');
  const [addPassword, setAddPassword] = useState('');

  const refreshUsers = () => {
    const updated = getUsers();
    setUsers(updated);
  };

  const handleUpdateStatus = (userId: string, newStatus: UserStatus) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    });

    saveUsers(updated);
    setUsers(updated);

    const statusText = newStatus === 'approved' ? 'DISETUJUI' : (newStatus === 'rejected' ? 'DITOLAK' : 'PENDING');
    const toastType = newStatus === 'approved' ? 'success' : (newStatus === 'rejected' ? 'error' : 'info');

    onShowToast(
      `Status Akun Diperbarui (${statusText})`,
      `Akun ${targetUser.name} (${targetUser.role === 'student' ? 'Murid' : 'Guru'}) telah diubah statusnya menjadi ${statusText}.`,
      toastType
    );
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    saveUsers(updated);
    setUsers(updated);

    onShowToast(
      'Peran Akun Diubah',
      `Peran akun ${targetUser.name} diubah menjadi ${newRole.toUpperCase()}.`,
      'info'
    );
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (targetUser.id === currentUser.id) {
      onShowToast('Gagal Menghapus', 'Anda tidak dapat menghapus akun Admin yang sedang digunakan!', 'error');
      return;
    }

    setUserToDelete(targetUser);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      onShowToast('Gagal Menghapus', 'Anda tidak dapat menghapus akun Admin yang sedang digunakan!', 'error');
      setUserToDelete(null);
      return;
    }

    const targetId = userToDelete.id;
    const targetName = userToDelete.name;

    const updated = users.filter(u => u.id !== targetId);
    deleteUser(targetId);
    setUsers(updated);
    setUserToDelete(null);

    onShowToast('Akun Berhasil Dihapus', `Akun ${targetName} telah berhasil dihapus dari database.`, 'success');
  };

  const handleOpenResetPasswordModal = (user: User) => {
    setUserToResetPassword(user);
    setResetPasswordValue('');
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToResetPassword) return;
    if (!resetPasswordValue.trim()) {
      onShowToast('Password Kosong', 'Password baru tidak boleh kosong.', 'error');
      return;
    }

    const targetId = userToResetPassword.id;
    const targetName = userToResetPassword.name;
    const newPass = resetPasswordValue.trim();

    const updated = users.map(u => {
      if (u.id === targetId) {
        return { ...u, password: newPass };
      }
      return u;
    });

    saveUsers(updated);
    setUsers(updated);
    setUserToResetPassword(null);

    const roleLabel = userToResetPassword.role === 'teacher' ? 'Guru' : (userToResetPassword.role === 'admin' ? 'Admin' : 'Murid');
    onShowToast(
      'Password Berhasil Direset',
      `Password untuk akun ${targetName} (${roleLabel}) berhasil diperbarui menjadi: "${newPass}"`,
      'success'
    );
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) {
      onShowToast('Form Belum Lengkap', 'Nama dan Email wajib diisi.', 'error');
      return;
    }

    const newUser: User = {
      id: 'u_' + addRole + '_' + Date.now(),
      name: addName.trim(),
      email: addEmail.trim().toLowerCase(),
      role: addRole,
      className: addRole === 'student' ? addClass : undefined,
      nisNip: addNisNip.trim() || (addRole === 'student' ? '2425' + Math.floor(1000 + Math.random() * 9000) : '1985' + Math.floor(10000 + Math.random() * 90000)),
      status: 'approved', // Pre-approved by admin
      createdAt: new Date().toISOString(),
      password: addPassword.trim() || ''
    };

    const updated = addUser(newUser);
    setUsers(updated);

    onShowToast('Akun Berhasil Ditambahkan', `Akun ${newUser.name} telah dibuat dan langsung disetujui (Approved).`, 'success');

    // Reset Form
    setAddName('');
    setAddEmail('');
    setAddNisNip('');
    setAddPassword('');
    setShowAddForm(false);
  };

  // Compute Statistics
  const totalUsersCount = users.length;
  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsersCount = users.filter(u => u.status === 'approved' || !u.status).length;
  const rejectedUsersCount = users.filter(u => u.status === 'rejected').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const text = [u.name, u.email, u.className || '', u.nisNip || '', u.role].join(' ').toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    
    const userStatus = u.status || 'approved';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-[#831843] via-[#be185d] to-[#881337] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-pink-200 text-xs font-semibold backdrop-blur-sm border border-white/20 mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Panel Kontrol Admin Utama Pengelola Sistem</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Persetujuan & Pengelolaan Akun Pengguna
            </h2>
            <p className="text-pink-100/90 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Kelola seluruh pendaftaran murid & guru, beri persetujuan (approval) akun baru, atur peran pengguna, dan jaga keamanan database SMP Islam Al Azhar 44.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Import Data Akun (CSV)</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 rounded-xl bg-white text-[#831843] hover:bg-pink-50 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#be185d]" />
              {showAddForm ? 'Tutup Form Tambah' : 'Tambah Akun Baru (Manual)'}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Add User Form Panel */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border-2 border-pink-200 shadow-lg animate-scale-up space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#831843] uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#be185d]" />
              Tambah Akun Baru Langsung Disetujui (Admin)
            </h3>
          </div>

          <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Peran Akun *</label>
              <select
                value={addRole}
                onChange={e => setAddRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="student">Murid / Siswa</option>
                <option value="teacher">Guru Pembina</option>
                <option value="admin">Admin Pengelola</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Bapak Irfan, M.Pd"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Sekolah *</label>
              <input
                type="email"
                required
                placeholder="email@smpialazhar44.sch.id"
                value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            {addRole === 'student' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelas *</label>
                <select
                  value={addClass}
                  onChange={e => setAddClass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                >
                  <option value="7A">Kelas 7A</option>
                  <option value="7B">Kelas 7B</option>
                  <option value="8A">Kelas 8A</option>
                  <option value="8B">Kelas 8B</option>
                  <option value="8C">Kelas 8C</option>
                  <option value="9A">Kelas 9A</option>
                  <option value="9B">Kelas 9B</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {addRole === 'student' ? 'NIS (Nomor Induk Siswa)' : 'NIP (Nomor Induk Pegawai)'}
              </label>
              <input
                type="text"
                placeholder={addRole === 'student' ? '242508099' : '198504122010012099'}
                value={addNisNip}
                onChange={e => setAddNisNip(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password Akun *</label>
              <input
                type="text"
                required
                placeholder="Password untuk login..."
                value={addPassword}
                onChange={e => setAddPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#005da8] hover:bg-[#003768] text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                Simpan & Disetujui
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Akun</span>
            <Users className="w-4 h-4 text-[#005da8]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalUsersCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Terdaftar di sistem</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-300 bg-amber-50/50 shadow-sm relative overflow-hidden">
          {pendingUsers.length > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
          )}
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu Approval</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{pendingUsers.length}</div>
          <p className="text-[10px] text-amber-700/80 mt-1">Memerlukan Konfirmasi Admin</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{approvedUsersCount}</div>
          <p className="text-[10px] text-emerald-700/80 mt-1">Aktif & dapat login</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ditolak</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">{rejectedUsersCount}</div>
          <p className="text-[10px] text-rose-700/80 mt-1">Akses ditutup</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-sm">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Murid vs Guru</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-black text-blue-900">{studentCount} Murid / {teacherCount} Guru</div>
          <p className="text-[10px] text-blue-700/80 mt-1">Komposisi akun aktif</p>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md overflow-hidden animate-fade-in">
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                  Antrean Persetujuan (Approval) Akun Baru ({pendingUsers.length})
                </h3>
                <p className="text-xs text-amber-700">
                  Konfirmasi atau tolak akun baru yang didaftarkan oleh murid atau guru.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-amber-100">
            {pendingUsers.map(user => (
              <div key={user.id} className="p-4 hover:bg-amber-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      user.role === 'teacher' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {user.role === 'teacher' ? 'Guru' : `Murid (Kelas ${user.className || '8A'})`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Email: <span className="font-semibold">{user.email}</span> • {user.role === 'teacher' ? 'NIP' : 'NIS'}: {user.nisNip || '-'}
                  </div>
                  {user.createdAt && (
                    <div className="text-[11px] text-slate-400">
                      Mendaftar pada: {new Date(user.createdAt).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(user.id, 'approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Setujui Akun
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(user.id, 'rejected')}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama, email, NIS/NIP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005da8]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005da8]"
          >
            <option value="all">Semua Status Akun</option>
            <option value="approved">Disetujui (Approved)</option>
            <option value="pending">Menunggu Approval (Pending)</option>
            <option value="rejected">Ditolak (Rejected)</option>
          </select>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#005da8]"
          >
            <option value="all">Semua Peran</option>
            <option value="student">Murid</option>
            <option value="teacher">Guru Pembina</option>
            <option value="admin">Admin Pengelola</option>
          </select>
        </div>

        <button
          onClick={refreshUsers}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {/* Database Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#005da8]" />
            Daftar Seluruh Akun Pengguna ({filteredUsers.length})
          </h3>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Upload File CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama & Email</th>
                <th className="py-3.5 px-4">Peran</th>
                <th className="py-3.5 px-4">NIS / NIP & Kelas</th>
                <th className="py-3.5 px-4">Status Approval</th>
                <th className="py-3.5 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const uStatus = u.status || 'approved';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value as UserRole)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-sky-100 text-[#003768] border-sky-300'
                              : u.role === 'teacher'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          <option value="student">Murid</option>
                          <option value="teacher">Guru</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 font-medium">
                        <div>{u.role === 'teacher' ? `NIP: ${u.nisNip || '-'}` : `NIS: ${u.nisNip || '-'}`}</div>
                        {u.role === 'student' && (
                          <div className="text-[11px] text-slate-400">Kelas {u.className || '-'}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {uStatus === 'approved' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Disetujui
                          </span>
                        )}
                        {uStatus === 'pending' && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[11px] rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Menunggu Approval
                          </span>
                        )}
                        {uStatus === 'rejected' && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-[11px] rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Ditolak
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {uStatus !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Setujui Akun Ini"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Setujui</span>
                          </button>
                        )}

                        {uStatus !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'rejected')}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg transition-colors text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Tolak Akun Ini"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Tolak</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenResetPasswordModal(u)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg transition-colors text-[11px] inline-flex items-center gap-1 cursor-pointer border border-amber-200"
                          title="Reset Password Akun Ini"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>Reset Pass</span>
                        </button>

                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                            title="Hapus Akun Permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data akun yang sesuai dengan pencarian / filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Akun User */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Akun</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong>{userToDelete.name}</strong> ({userToDelete.email}) dari database sistem?
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password User */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-100 rounded-xl">
                <KeyRound className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Password Pengguna</h3>
                <p className="text-xs text-slate-500">
                  Atur password baru untuk akun pengguna ini.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{userToResetPassword.name}</div>
              <div className="text-slate-500">{userToResetPassword.email}</div>
              <div className="text-slate-600 font-medium">
                Peran: <span className="font-bold text-slate-800">{userToResetPassword.role === 'teacher' ? 'Guru' : (userToResetPassword.role === 'admin' ? 'Admin Utama' : `Murid (Kelas ${userToResetPassword.className || '-'})`)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Baru *
                </label>
                <input
                  type="text"
                  required
                  value={resetPasswordValue}
                  onChange={e => setResetPasswordValue(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#005da8] focus:bg-white transition-all"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-slate-400">
                    Masukkan password pengganti secara manual.
                  </span>
                  <button
                    type="button"
                    onClick={() => setResetPasswordValue('123456')}
                    className="text-[11px] text-[#005da8] hover:underline font-semibold cursor-pointer"
                  >
                    Set Default "123456"
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserToResetPassword(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Simpan Password Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Import Users CSV Modal */}
      <ImportUsersModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(updatedUsers) => {
          setUsers(updatedUsers);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
