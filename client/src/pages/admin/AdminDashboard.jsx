import ProtectedLayout from '../../components/layout/ProtectedLayout';

export default function AdminDashboard() {
  return (
    <ProtectedLayout title="Admin Portal" allowedRoles={['admin']}>
      <div className="grid grid-4 mb-xl">
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-value">3,492</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-change">↑ 245 this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-value">42</div>
          <div className="stat-label">Faculty Members</div>
          <div className="stat-change" style={{ color: 'var(--text-secondary)' }}>Stable</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-value">99.9%</div>
          <div className="stat-label">System Uptime</div>
          <div className="stat-change">All systems operational</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-value">12</div>
          <div className="stat-label">Active Subscriptions</div>
          <div className="stat-change">↑ 2 new domains</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-bold">Recent Signups</h3>
            <button className="btn btn-secondary btn-sm">View All Users</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-primary">john.doe@demo.com</td>
                <td>Student</td>
                <td>2 mins ago</td>
                <td><span className="badge badge-accent">Verified</span></td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">prof.smith@university.edu</td>
                <td>Faculty</td>
                <td>1 hour ago</td>
                <td><span className="badge badge-warning">Pending Review</span></td>
              </tr>
              <tr>
                <td className="font-semibold text-primary">sarah.j@demo.com</td>
                <td>Student</td>
                <td>3 hours ago</td>
                <td><span className="badge badge-accent">Verified</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-bold mb-md">System Health & Alerts</h3>
          <div className="flex flex-col gap-sm">
            <div className="p-md border rounded bg-glass" style={{ borderColor: 'var(--color-accent)' }}>
              <div className="font-bold text-accent">✅ Database Connection Stable</div>
              <div className="text-sm text-secondary">Latency: 42ms. 0 errors in the last 24h.</div>
            </div>
            <div className="p-md border rounded bg-glass" style={{ borderColor: 'var(--color-warning)' }}>
              <div className="font-bold text-warning">⚠️ High API Usage Detected</div>
              <div className="text-sm text-secondary">Code execution service is at 85% capacity.</div>
            </div>
            <div className="p-md border rounded bg-glass" style={{ borderColor: 'var(--color-primary)' }}>
              <div className="font-bold text-primary">🔄 New Version Available</div>
              <div className="text-sm text-secondary">Update v2.4.1 is ready to be deployed.</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
