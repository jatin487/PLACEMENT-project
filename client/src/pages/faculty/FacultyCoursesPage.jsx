import { useState } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useNavigate } from 'react-router-dom';
import UploadLectureModal from '../../components/faculty/UploadLectureModal';

export default function FacultyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([
    { id: 1, title: 'Data Structures & Algorithms', students: 120, status: 'Active', category: 'Technical', duration: '48 hours' },
    { id: 2, title: 'Advanced React & Full Stack', students: 85, status: 'Active', category: 'Project', duration: '56 hours' },
    { id: 3, title: 'Database Management & SQL', students: 150, status: 'Draft', category: 'Technical', duration: '32 hours' },
    { id: 4, title: 'Operating Systems & Linux', students: 95, status: 'Active', category: 'Technical', duration: '36 hours' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'Technical', duration: '30 hours', status: 'Active' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setForm({ title: '', category: 'Technical', duration: '30 hours', status: 'Active' });
    setShowModal(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setForm({ title: course.title, category: course.category, duration: course.duration, status: course.status });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(c => c.id !== id));
      showToast('Course deleted successfully');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingCourse) {
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...form } : c));
      showToast('Course updated successfully');
    } else {
      const newCourse = {
        id: Date.now(),
        title: form.title,
        students: 0,
        status: form.status,
        category: form.category,
        duration: form.duration,
      };
      setCourses(prev => [newCourse, ...prev]);
      showToast('New course created successfully! 🎉');
    }
    setShowModal(false);
  };

  return (
    <ProtectedLayout title="Manage Courses" allowedRoles={['faculty', 'admin']}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white',
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Manage Courses & Lectures 📚</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create, update, and manage your training modules and video lectures.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowVideoModal(true)} style={{ padding: '10px 18px', background: '#4f46e5', color: 'white', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            📹 Upload Video Lecture
          </button>
          <button onClick={handleOpenAdd} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(37,99,235,0.3)' }}>
            + Create New Course
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card" style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px' }}>Course Title</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Enrolled Students</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                <td style={{ padding: '16px', fontWeight: 700, color: '#0f172a' }}>{c.title}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                    {c.category}
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#475569' }}>👥 {c.students} students</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, background: c.status === 'Active' ? '#ecfdf5' : '#fffbeb', color: c.status === 'Active' ? '#059669' : '#b45309', border: `1px solid ${c.status === 'Active' ? '#a7f3d0' : '#fde68a'}` }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button onClick={() => handleOpenEdit(c)} style={{ padding: '6px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: 8, color: '#334155' }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ padding: '6px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Course Title</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. System Design Masterclass" required />
              </div>
              <div style={{ marginBottom: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category</label>
                  <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="Technical">Technical</option>
                    <option value="Professional">Professional</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                  <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Duration</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 40 hours" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 18px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 22px', background: '#2563eb', color: 'white', borderRadius: 8, cursor: 'pointer', fontWeight: 700, border: 'none' }}>
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Video Lecture Modal */}
      <UploadLectureModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </ProtectedLayout>
  );
}
