import { useState, useEffect } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { userAPI } from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (isoStr) => {
  if (!isoStr) return '-';
  const diff = (Date.now() - new Date(isoStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const exportCSV = (rows) => {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Batch', 'Status', 'Joined', 'Skill Points'];
  const lines = [
    headers.join(','),
    ...rows.map(u =>
      [u._id, u.name, u.email, u.role, u.department, u.batch, u.status, new Date(u.createdAt).toLocaleDateString(), u.skillPoints].join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ROLE_BADGE = {
  student: { label: 'Student', color: 'var(--color-primary)' },
  faculty: { label: 'Faculty', color: 'var(--color-accent)' },
  admin:   { label: 'Admin',   color: 'var(--color-warning)' },
  recruiter: { label: 'Recruiter', color: 'var(--color-accent)' },
};
const STATUS_BADGE = {
  active:    { label: 'Active',    bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  suspended: { label: 'Suspended', bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
};

// ── Badge Component ───────────────────────────────────────────────────────────
const Badge = ({ type, value }) => {
  const map = type === 'role' ? ROLE_BADGE : STATUS_BADGE;
  const cfg = map[value] || { label: value || '-', bg: '#333', color: '#fff' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
      background: cfg.bg || `${cfg.color}22`, color: cfg.color,
      border: `1px solid ${cfg.color}55`,
    }}>
      {cfg.label}
    </span>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const Modal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false, loading = false }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  }}>
    <div className="card" style={{ maxWidth: 420, width: '90%', padding: '32px' }}>
      <h3 style={{ marginBottom: 12, fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>{message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'} flex-1`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait...' : confirmText}
        </button>
        <button className="btn btn-secondary flex-1" onClick={onCancel} disabled={loading}>Cancel</button>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type, userId }
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = '#10b981') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userAPI.getAll();
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAction = (type, userId) => setModal({ type, userId });

  const confirmAction = async () => {
    const { type, userId } = modal;
    setActionLoading(true);
    try {
      if (type === 'suspend') {
        const res = await userAPI.updateStatus(userId, 'suspended');
        setUsers(prev => prev.map(u => (u._id === userId ? res.data.user : u)));
        showToast('User suspended successfully.', '#f59e0b');
      } else if (type === 'activate') {
        const res = await userAPI.updateStatus(userId, 'active');
        setUsers(prev => prev.map(u => (u._id === userId ? res.data.user : u)));
        showToast('User activated successfully.');
      } else if (type === 'delete') {
        await userAPI.delete(userId);
        setUsers(prev => prev.filter(u => u._id !== userId));
        showToast('User deleted successfully.', '#ef4444');
      }
      setModal(null);
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${type} user`, '#ef4444');
    } finally {
      setActionLoading(false);
    }
  };

  const targetUser = modal ? users.find(u => u._id === modal.userId) : null;

  const MODAL_CONFIG = {
    suspend: { title: '⚠️ Suspend User', message: `Are you sure you want to suspend ${targetUser?.name}? They will lose access immediately.`, confirmText: 'Suspend', danger: true },
    activate: { title: '✅ Activate User', message: `Activate ${targetUser?.name}'s account and restore their access?`, confirmText: 'Activate', danger: false },
    delete: { title: '🗑️ Delete User', message: `This will permanently delete ${targetUser?.name}. This cannot be undone.`, confirmText: 'Delete', danger: true },
  };

  return (
    <ProtectedLayout title="User Management" allowedRoles={['admin']}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 999,
          background: toast.color, color: '#fff', padding: '12px 20px',
          borderRadius: 12, fontWeight: 600, fontSize: '0.875rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Confirm Modal */}
      {modal && MODAL_CONFIG[modal.type] && (
        <Modal
          {...MODAL_CONFIG[modal.type]}
          onConfirm={confirmAction}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Stats Row */}
      <div className="grid grid-4 mb-xl">
        {[
          { icon: '🌍', val: users.length, label: 'Total Users' },
          { icon: '🎓', val: users.filter(u => u.role === 'student').length, label: 'Students' },
          { icon: '🏫', val: users.filter(u => u.role === 'faculty').length, label: 'Faculty' },
          { icon: '🔴', val: users.filter(u => u.status === 'suspended').length, label: 'Suspended' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Actions */}
      <div className="card mb-lg">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-select" style={{ width: 140 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
            <option value="recruiter">Recruiter</option>
          </select>
          <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => exportCSV(filtered)}
            title="Export current filtered list as CSV"
          >
            📥 Export CSV
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {loading ? 'Loading users...' : `Showing ${filtered.length} of ${users.length} users`}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        {error ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Batch</th>
                <th>Skill Points</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td><Badge type="role" value={u.role} /></td>
                  <td>{u.department || '-'}</td>
                  <td>{u.batch || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{(u.skillPoints || 0).toLocaleString()}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{timeAgo(u.createdAt)}</td>
                  <td><Badge type="status" value={u.status || 'active'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(u.status || 'active') !== 'suspended' && u.role !== 'admin' && (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid #f59e0b55', fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => handleAction('suspend', u._id)}
                        >
                          Suspend
                        </button>
                      )}
                      {u.status === 'suspended' && (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b98155', fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => handleAction('activate', u._id)}
                        >
                          Activate
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          className="btn btn-sm btn-danger"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => handleAction('delete', u._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ProtectedLayout>
  );
}