import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ProtectedLayout title="Faculty Dashboard" allowedRoles={['faculty']}>
      <div className="grid grid-3 mb-xl">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">124</div>
          <div className="stat-label">Active Students</div>
          <div className="stat-change">↑ 12% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">8</div>
          <div className="stat-label">Courses Managed</div>
          <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>All active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">45</div>
          <div className="stat-label">Quizzes Created</div>
          <div className="stat-change">↑ 3 this week</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-bold">Recent Assessments</h3>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/quizzes/create')}>Create New</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submissions</th>
                <th>Avg. Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-primary">Data Structures Midterm</td>
                <td>112/124</td>
                <td>84%</td>
                <td><span className="badge badge-accent">Active</span></td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">React Basics Quiz</td>
                <td>98/124</td>
                <td>76%</td>
                <td><span className="badge badge-warning">Draft</span></td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">SQL Joins Practice</td>
                <td>124/124</td>
                <td>92%</td>
                <td><span className="badge badge-muted">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-bold mb-md">Top Performing Students</h3>
          <div className="flex flex-col gap-sm">
            {[
              { name: 'Alice Smith', score: '98%', rank: 1 },
              { name: 'Bob Johnson', score: '95%', rank: 2 },
              { name: 'Charlie Brown', score: '94%', rank: 3 },
              { name: 'Diana Prince', score: '91%', rank: 4 },
            ].map(student => (
              <div key={student.rank} className="leaderboard-row">
                <div className={`leaderboard-rank rank-${student.rank}`}>{student.rank}</div>
                <div className="flex-1 font-semibold text-primary">{student.name}</div>
                <div className="font-bold">{student.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
