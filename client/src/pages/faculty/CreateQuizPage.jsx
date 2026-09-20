import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function CreateQuizPage() {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      alert('Quiz title is required');
      return;
    }

    try {
      const payload = {
        title: trimmedTitle,
        type: 'mcq',
        questions: [],
        totalScore: 100,
      };

      await API.post('/assessments', payload);
      alert('Quiz saved successfully!');
      navigate('/faculty/dashboard');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save quiz');
    }
  };

  return (
    <ProtectedLayout title="Create Quiz" allowedRoles={['faculty']}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="font-bold text-lg mb-lg">New Assessment</h2>

        <div className="form-group">
          <label className="form-label">Quiz Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Midterm JavaScript Assessment"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-md mt-xl">
          <button className="btn btn-secondary" onClick={() => navigate('/faculty/dashboard')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Quiz</button>
        </div>
      </div>
    </ProtectedLayout>
  );
}
