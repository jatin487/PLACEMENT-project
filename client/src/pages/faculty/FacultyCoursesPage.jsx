import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await API.get('/courses');
      setCourses(response.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (event) => {
    event.preventDefault();

    const title = formData.title.trim();
    if (!title) {
      alert('Course title is required');
      return;
    }

    try {
      const payload = {
        title,
        description: formData.description.trim(),
        modules: [],
        videos: [],
        notes: [],
        quizzes: [],
      };

      const response = await API.post('/courses', payload);
      setCourses((prevCourses) => [response.data.course, ...prevCourses]);
      setFormData({ title: '', description: '' });
      setShowCreateForm(false);
      alert('Course created successfully');
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      const response = await API.delete(`/courses/${id}`);
      if (response.data?.success) {
        setCourses((prevCourses) => prevCourses.filter((course) => (course._id || course.id) !== id));
      } else {
        alert(response.data?.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to delete course');
    }
  };

  return (
    <ProtectedLayout title="Manage Courses" allowedRoles={['faculty']}>
      <div className="card">
        <div className="flex justify-between items-center mb-md">
          <h2 className="font-bold text-lg">Your Courses</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? 'Close' : 'Create Course'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateCourse} className="mb-lg p-md border rounded-md">
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="e.g. Full Stack Web Development"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Brief course summary"
              />
            </div>

            <div className="flex justify-end gap-md">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Course
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Enrolled Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No courses available yet.</td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id || course.id}>
                    <td className="font-semibold text-primary">{course.title}</td>
                    <td>{course.students ?? 0}</td>
                    <td>
                      <span className={`badge ${course.status === 'Active' ? 'badge-accent' : 'badge-warning'}`}>
                        {course.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary mr-sm">Edit</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteCourse(course._id || course.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </ProtectedLayout>
  );
}
