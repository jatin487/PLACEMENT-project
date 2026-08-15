import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuizPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState('Data Structures');
  const [isProctored, setIsProctored] = useState(true);
  const [questions, setQuestions] = useState([
    { id: 1, text: 'What is the worst-case time complexity of Quick Sort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(1)'], correct: 1 },
  ]);
  const [toast, setToast] = useState(null);

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }
    ]);
  };

  const updateQuestionText = (index, text) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].text = text;
      return updated;
    });
  };

  const updateOptionText = (qIndex, oIndex, text) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].options[oIndex] = text;
      return updated;
    });
  };

  const setCorrectOption = (qIndex, oIndex) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].correct = oIndex;
      return updated;
    });
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setToast({ msg: 'Please enter a quiz title', type: 'error' });
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setToast({ msg: 'Assessment published successfully! 🚀', type: 'success' });
    setTimeout(() => {
      navigate('/faculty/dashboard');
    }, 1200);
  };

  return (
    <ProtectedLayout title="Create Quiz & Assessment" allowedRoles={['faculty', 'admin']}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white',
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Create New Assessment 📝</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Build proctored MCQ tests and quizzes for student evaluation.</p>
        </div>

        {/* Basic Info Card */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>1. Assessment Details</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Quiz Title</label>
            <input
              type="text"
              style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }}
              placeholder="e.g. DSA Graphs & Dynamic Programming Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Duration (Minutes)</label>
              <input
                type="number"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category</label>
              <select
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Data Structures">Data Structures</option>
                <option value="Algorithms">Algorithms</option>
                <option value="DBMS">Database Systems</option>
                <option value="Web Development">Web Development</option>
                <option value="Aptitude">Aptitude & Reasoning</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Proctoring</label>
              <select
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem' }}
                value={isProctored ? 'yes' : 'no'}
                onChange={(e) => setIsProctored(e.target.value === 'yes')}
              >
                <option value="yes">🛡️ Enabled (AI Webcam + Lock)</option>
                <option value="no">Standard (No Proctoring)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions Builder */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>2. Question Builder ({questions.length})</h2>
            <button onClick={addQuestion} style={{ padding: '8px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
              + Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={q.id} style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2563eb' }}>Question {qIndex + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', marginBottom: 12, background: 'white' }}
                placeholder="Enter question statement..."
                value={q.text}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
              />

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {q.options.map((opt, oIndex) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isCorrect = q.correct === oIndex;
                  return (
                    <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, background: isCorrect ? '#ecfdf5' : 'white', border: `1px solid ${isCorrect ? '#a7f3d0' : '#e2e8f0'}`, borderRadius: 8, padding: '6px 12px' }}>
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={isCorrect}
                        onChange={() => setCorrectOption(qIndex, oIndex)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.78rem', color: isCorrect ? '#059669' : '#64748b' }}>{letters[oIndex]}:</span>
                      <input
                        type="text"
                        style={{ flex: 1, border: 'none', background: 'none', fontSize: '0.85rem', outline: 'none' }}
                        placeholder={`Option ${letters[oIndex]}`}
                        value={opt}
                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 0' }}>
          <button onClick={() => navigate('/faculty/dashboard')} style={{ padding: '11px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ padding: '11px 28px', background: '#2563eb', color: 'white', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
            Publish Assessment 🚀
          </button>
        </div>
      </div>
    </ProtectedLayout>
  );
}
