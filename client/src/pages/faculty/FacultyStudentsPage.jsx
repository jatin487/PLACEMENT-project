import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Loader2, Download } from 'lucide-react';

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/auth/users');
      const data = res.data;
      const allUsers = Array.isArray(data) ? data : (data.users || []);
      const studentList = allUsers.filter(u => u.role === 'student');
      setStudents(studentList);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students data.');
    } finally {
      setLoading(false);
    }
  };

  // Get list of unique departments for filter dropdown
  const departments = ['All', ...new Set(students.map(s => s.department).filter(Boolean))];

  const filteredStudents = students.filter(s => {
    const q = searchQuery.trim().toLowerCase();
    const nameMatch = s.name ? s.name.toLowerCase().includes(q) : false;
    const emailMatch = s.email ? s.email.toLowerCase().includes(q) : false;
    const deptMatch = s.department ? s.department.toLowerCase().includes(q) : false;
    const batchMatch = s.batch ? s.batch.toLowerCase().includes(q) : false;

    const matchesSearch = !q || nameMatch || emailMatch || deptMatch || batchMatch;
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleExportCSV = () => {
    if (!filteredStudents.length) return;

    const headers = ['Name', 'Email', 'Department', 'Batch', 'Skill Points', 'Streak', 'Last Active'];
    const rows = filteredStudents.map(s => [
      s.name || '',
      s.email || '',
      s.department || 'N/A',
      s.batch || 'N/A',
      s.skillPoints ?? 0,
      s.streak ?? 0,
      s.lastActive || 'N/A'
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `student_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedLayout title="Student Directory" allowedRoles={['faculty', 'admin']}>
      <div className="card">
        <div className="flex justify-between items-center mb-md flex-wrap gap-md">
          <div className="flex items-center gap-md">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search student by name..." 
              style={{ maxWidth: '300px' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {departments.length > 1 && (
              <select 
                className="form-select" 
                style={{ minWidth: '150px' }}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'All' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={handleExportCSV}
            disabled={filteredStudents.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px 0', gap: 8, color: 'var(--text-secondary)' }}>
            <Loader2 size={24} className="animate-spin" /> Fetching student records...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-danger)' }}>
            <p>{error}</p>
            <button className="btn btn-sm btn-secondary" onClick={fetchStudents} style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Batch</th>
                <th>Skill Points</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(s => (
                  <tr key={s._id || s.id}>
                    <td className="font-semibold text-primary">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.department || 'N/A'}</td>
                    <td>{s.batch || 'N/A'}</td>
                    <td style={{ fontWeight: 700 }}>{s.skillPoints ?? 0} pts</td>
                    <td>🔥 {s.streak ?? 0} days</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    No students found {searchQuery ? `matching "${searchQuery}"` : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </ProtectedLayout>
  );
}

