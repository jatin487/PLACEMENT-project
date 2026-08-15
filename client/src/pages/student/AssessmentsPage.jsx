import { useState, useEffect, useRef } from 'react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import ProctoringMonitor from '../../components/ui/ProctoringMonitor';
import { useProctoringSession, SESSION_STATUS } from '../../hooks/useProctoringSession';
import { useAuth } from '../../context/AuthContext';
import { SAMPLE_MCQ } from '../../data/seedData';

const QUIZ_TIME = 10 * 60; // 10 minutes in seconds
const MAX_VIOLATIONS = 3;

// ─── Timer Component ──────────────────────────────────────────────────────────

function QuizTimer({ seconds, onExpire }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const isWarning = seconds < 120;
  useEffect(() => { if (seconds === 0) onExpire(); }, [seconds]);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: isWarning ? 'rgba(239,68,68,0.15)' : 'var(--bg-glass)',
      border: `1px solid ${isWarning ? 'rgba(239,68,68,0.4)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-full)',
      padding: '8px 16px',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      fontSize: '1.1rem',
      color: isWarning ? 'var(--color-danger)' : 'var(--text-primary)',
      animation: isWarning ? 'pulse-glow 1s infinite' : 'none',
    }}>
      ⏱ {mins}:{secs}
    </div>
  );
}

// ─── Cancellation Screen ──────────────────────────────────────────────────────

function CancellationScreen({ reason, assessmentTitle, onBack }) {
  return (
    <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '56px 32px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🚫</div>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-danger)', marginBottom: '8px' }}>
        Assessment Cancelled
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem' }}>
        Your session for <strong style={{ color: 'var(--text-primary)' }}>{assessmentTitle}</strong> has been
        automatically cancelled due to proctoring violations.
      </p>

      <div className="card" style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        marginBottom: '32px',
        textAlign: 'left',
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>
          REASON
        </div>
        <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
          {reason || 'Maximum proctoring violations exceeded.'}
        </div>
      </div>

      <div className="card" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', marginBottom: '32px', textAlign: 'left' }}>
        <h4 className="font-bold" style={{ marginBottom: '10px', color: 'var(--color-danger)' }}>⚠️ What this means</h4>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '18px', lineHeight: 1.8 }}>
          <li>This session cannot be resumed or retaken</li>
          <li>Your answers have not been scored</li>
          <li>Contact your faculty if you believe this is an error</li>
        </ul>
      </div>

      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Assessments
      </button>
    </div>
  );
}

// ─── Session Loading Screen ───────────────────────────────────────────────────

function SessionLoadingScreen({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
      <div className="animate-float" style={{ fontSize: '3rem' }}>🛡️</div>
      <p style={{ color: 'var(--text-secondary)' }}>{message || 'Initializing proctored session…'}</p>
    </div>
  );
}

// ─── Proctored MCQ Quiz ───────────────────────────────────────────────────────

function ProcturedMCQQuiz({ quiz, sessionId, violationCount, maxViolations, isCancelled, onViolation, onFinish }) {
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState({});
  const [timeLeft, setTimeLeft]   = useState(QUIZ_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult]       = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit();
  }, [timeLeft, submitted]);

  // If session gets cancelled externally (from Firestore listener), auto-stop quiz
  useEffect(() => {
    if (isCancelled && !submitted) {
      clearInterval(timerRef.current);
    }
  }, [isCancelled, submitted]);

  const handleSelect = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) score++;
    });
    const pct = Math.round((score / quiz.questions.length) * 100);
    const resultData = { score, total: quiz.questions.length, percentage: pct };
    setResult(resultData);
    setSubmitted(true);
    // Notify parent with answers + score so it can persist to Firestore
    await onFinish({ answers, score: pct, submitted: true });
  };

  // If externally cancelled mid-quiz
  if (isCancelled) return null;

  if (submitted && result) {
    return (
      <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
          {result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold" style={{ marginBottom: '8px' }}>
          {result.percentage >= 80 ? 'Excellent!' : result.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '16px 0' }}>
          {result.percentage}%
        </div>
        <p className="text-secondary" style={{ marginBottom: '24px' }}>
          You scored <strong style={{ color: 'var(--text-primary)' }}>{result.score} / {result.total}</strong> questions correctly
        </p>

        {/* Answer Review */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <h3 className="font-bold text-lg" style={{ marginBottom: '16px' }}>Answer Review</h3>
          {quiz.questions.map((q, i) => {
            const isCorrect = answers[q.id] === q.correct_answer;
            return (
              <div key={q.id} className="card" style={{ marginBottom: '12px', borderColor: isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', background: isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)' }}>
                <div className="flex items-center gap-sm" style={{ marginBottom: '8px' }}>
                  <span>{isCorrect ? '✅' : '❌'}</span>
                  <span className="font-semibold text-sm">Q{i + 1}. {q.question_text}</span>
                </div>
                {!isCorrect && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginBottom: '4px' }}>
                    Your answer: <em>{answers[q.id] || 'Not answered'}</em>
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                  ✓ Correct: <strong>{q.correct_answer}</strong>
                </div>
                {q.explanation && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn btn-secondary" onClick={() => onFinish({ done: true })}>
          ← Back to Assessments
        </button>
      </div>
    );
  }

  const q = quiz.questions[currentQ];
  const answered = Object.keys(answers).length;

  return (
    <div className="animate-fadeIn">
      {/* Quiz Header */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 24px' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{quiz.title}</h2>
            <div className="text-xs text-muted">{answered} of {quiz.questions.length} answered</div>
          </div>
          <QuizTimer seconds={timeLeft} onExpire={handleSubmit} />
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Quiz</button>
        </div>
        {/* Progress */}
        <div className="progress-bar-container" style={{ marginTop: '12px', height: '4px' }}>
          <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '20px', alignItems: 'start' }}>
        {/* Question */}
        <div className="card">
          <div className="flex items-center gap-sm" style={{ marginBottom: '20px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
            }}>
              {currentQ + 1}
            </div>
            <div className="text-xs text-muted">Question {currentQ + 1} of {quiz.questions.length}</div>
          </div>

          <p className="font-semibold" style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {q.question_text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.options.map((opt, i) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button key={i} onClick={() => handleSelect(q.id, opt)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 18px',
                    borderRadius: 'var(--radius-md)', border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-default)'}`,
                    background: isSelected ? 'var(--color-primary-glow)' : 'var(--bg-glass)',
                    color: isSelected ? 'var(--color-primary-light)' : 'var(--text-primary)',
                    cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-glass-hover)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-glass)'; }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-full)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem',
                    background: isSelected ? 'var(--color-primary)' : 'var(--bg-elevated)', color: 'white', flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between" style={{ marginTop: '24px' }}>
            <button className="btn btn-secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(c => c - 1)}>← Prev</button>
            {currentQ < quiz.questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrentQ(c => c + 1)}>Next →</button>
              : <button className="btn btn-accent" onClick={handleSubmit}>Submit Quiz ✅</button>
            }
          </div>
        </div>

        {/* Question Navigator */}
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <h3 className="font-bold" style={{ marginBottom: '16px' }}>Question Navigator</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {quiz.questions.map((_, i) => {
              const isAnswered = answers[quiz.questions[i].id] !== undefined;
              const isCurrent = i === currentQ;
              return (
                <button key={i} onClick={() => setCurrentQ(i)} style={{
                  aspectRatio: '1', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.875rem',
                  border: `2px solid ${isCurrent ? 'var(--color-primary)' : isAnswered ? 'var(--color-accent)' : 'var(--border-default)'}`,
                  background: isCurrent ? 'var(--color-primary-glow)' : isAnswered ? 'var(--color-accent-glow)' : 'var(--bg-glass)',
                  color: isCurrent ? 'var(--color-primary-light)' : isAnswered ? 'var(--color-accent-light)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Violation info in navigator */}
          {violationCount > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              marginBottom: '12px',
              fontSize: '0.78rem',
              color: 'var(--color-danger)',
            }}>
              ⚠️ {violationCount}/{maxViolations} violations recorded
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
            {[
              { color: 'var(--color-primary)', label: 'Current' },
              { color: 'var(--color-accent)', label: 'Answered' },
              { color: 'var(--border-default)', label: 'Not Answered' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-sm">
                <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <span className="text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Wrapper with Proctoring ─────────────────────────────────────────────

function ProcturedQuizWrapper({ assessment, onExitToList }) {
  const { user } = useAuth();

  const {
    sessionId,
    sessionStatus,
    violationCount,
    maxViolations,
    cancellationReason,
    isLoading,
    isCancelled,
    isSubmitted,
    isActive,
    reportViolation,
    submitSession,
  } = useProctoringSession({
    assessmentId: String(assessment.id),
    assessmentTitle: assessment.title,
    maxViolations: MAX_VIOLATIONS,
    totalQuestions: SAMPLE_MCQ.length,
    // Only enable proctoring for real Firebase sessions (not demo/fallback tokens)
    enabled: true,
  });

  const [quizDone, setQuizDone] = useState(false);

  // ── Handle quiz completion ──────────────────────────────────────────────
  const handleQuizFinish = async ({ answers, score, done }) => {
    if (done) {
      onExitToList();
      return;
    }
    // Submit the session through the trusted backend
    await submitSession({ answers: answers || {}, score: score || 0 });
    setQuizDone(true);
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <ProtectedLayout title={assessment.title} allowedRoles={['student']}>
        <SessionLoadingScreen
          message={
            sessionStatus === SESSION_STATUS.CHECKING
              ? 'Checking for existing sessions…'
              : 'Initializing proctored session…'
          }
        />
      </ProtectedLayout>
    );
  }

  // ── Cancelled state (persisted from Firestore) ──────────────────────────
  if (isCancelled) {
    return (
      <ProtectedLayout title="Assessment Cancelled" allowedRoles={['student']}>
        <CancellationScreen
          reason={cancellationReason}
          assessmentTitle={assessment.title}
          onBack={onExitToList}
        />
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout title={`${assessment.title} — Proctored`} allowedRoles={['student']}>
      {/* Proctoring Monitor — renders webcam + behavioral listeners */}
      <ProctoringMonitor
        sessionId={sessionId}
        violationCount={violationCount}
        maxViolations={maxViolations}
        isCancelled={isCancelled}
        onViolation={reportViolation}
        webcamEnabled={true}
      />

      {/* Quiz content */}
      {isActive && !quizDone && (
        <ProcturedMCQQuiz
          quiz={{ title: assessment.title, questions: SAMPLE_MCQ }}
          sessionId={sessionId}
          violationCount={violationCount}
          maxViolations={maxViolations}
          isCancelled={isCancelled}
          onViolation={reportViolation}
          onFinish={handleQuizFinish}
        />
      )}

      {/* Submitted state — after quiz completes */}
      {(isSubmitted || quizDone) && !isCancelled && (
        <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
          <h2 className="text-2xl font-bold" style={{ marginBottom: '8px' }}>Session Submitted!</h2>
          <p className="text-secondary" style={{ marginBottom: '24px' }}>
            Your answers have been securely saved and the session is now closed.
          </p>
          <button className="btn btn-secondary" onClick={onExitToList}>← Back to Assessments</button>
        </div>
      )}
    </ProtectedLayout>
  );
}

// ─── Assessments List Page ────────────────────────────────────────────────────

export default function AssessmentsPage() {
  const [activeTab, setActiveTab]   = useState('all');
  const [activeQuiz, setActiveQuiz] = useState(null);

  const quizTypes = [
    { id: 'all',    label: 'All Tests',   icon: '📋' },
    { id: 'mcq',    label: 'MCQ Tests',   icon: '📝' },
    { id: 'coding', label: 'Coding',      icon: '💻' },
    { id: 'mock',   label: 'Mock Tests',  icon: '🎯' },
  ];

  const assessments = [
    { id: 1, title: 'DSA Fundamentals MCQ',       type: 'mcq',    questions: 20, time: 30, difficulty: 'medium', topics: ['Arrays', 'Sorting', 'Searching'] },
    { id: 2, title: 'DBMS Comprehensive Test',     type: 'mcq',    questions: 25, time: 40, difficulty: 'hard',   topics: ['SQL', 'Normalization'] },
    { id: 3, title: 'Aptitude Reasoning Test',     type: 'mcq',    questions: 30, time: 45, difficulty: 'medium', topics: ['Quant', 'Logical'] },
    { id: 4, title: 'Full Mock Placement Test',    type: 'mock',   questions: 60, time: 90, difficulty: 'hard',   topics: ['All Topics'] },
    { id: 5, title: 'Two Sum Problem',             type: 'coding', questions: 1,  time: 20, difficulty: 'easy',   topics: ['Arrays', 'HashMap'] },
    { id: 6, title: 'Binary Search Challenge',     type: 'coding', questions: 1,  time: 15, difficulty: 'medium', topics: ['DSA', 'Binary Search'] },
  ];

  const filtered = activeTab === 'all' ? assessments : assessments.filter(a => a.type === activeTab);

  // ── Active quiz renders the proctored wrapper ──────────────────────────
  if (activeQuiz) {
    return (
      <ProcturedQuizWrapper
        assessment={activeQuiz}
        onExitToList={() => setActiveQuiz(null)}
      />
    );
  }

  return (
    <ProtectedLayout title="Assessments" allowedRoles={['student']}>
      <div className="page-header">
        <h1 className="page-title">Assessments 📝</h1>
        <p className="page-subtitle">Topic-wise MCQs, coding challenges, and full mock placement tests.</p>
      </div>

      {/* Proctoring Notice Banner */}
      <div className="card animate-fadeInUp" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
        border: '1px solid rgba(99,102,241,0.25)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
      }}>
        <span style={{ fontSize: '1.5rem' }}>🛡️</span>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--color-primary-light)' }}>
            Proctored Assessments
          </div>
          <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
            All MCQ and mock tests are monitored. Tab switching, fullscreen exits, and copy-paste are tracked.
            Your session state is securely stored — refreshing the page will resume your session.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-sm animate-fadeInUp" style={{ marginBottom: '24px' }}>
        {quizTypes.map((t) => (
          <button key={t.id}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-4 animate-fadeInUp" style={{ marginBottom: '24px' }}>
        {[
          { icon: '✅', value: '23',  label: 'Tests Completed',  color: 'var(--color-accent)'   },
          { icon: '📊', value: '78%', label: 'Average Score',    color: 'var(--color-primary)'  },
          { icon: '🔥', value: '5',   label: 'Day Streak',       color: 'var(--color-warning)'  },
          { icon: '🏆', value: '#12', label: 'Leaderboard Rank', color: '#a855f7'               },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: '1.75rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Assessment List */}
      <div className="animate-fadeInUp animate-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((a) => (
          <div key={a.id} className="quiz-card">
            <div className="quiz-icon" style={{
              background: a.type === 'mock' ? 'rgba(245,158,11,0.15)' : a.type === 'coding' ? 'var(--color-accent-glow)' : 'var(--color-primary-glow)',
            }}>
              {a.type === 'mock' ? '🎯' : a.type === 'coding' ? '💻' : '📝'}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-sm" style={{ marginBottom: '4px' }}>
                <span className="font-bold">{a.title}</span>
                <span className={`badge badge-${a.difficulty === 'hard' ? 'danger' : a.difficulty === 'medium' ? 'warning' : 'accent'}`}>
                  {a.difficulty}
                </span>
                {a.type !== 'coding' && (
                  <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-light)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    🛡️ Proctored
                  </span>
                )}
              </div>
              <div className="flex gap-md text-xs text-muted">
                <span>📋 {a.questions} questions</span>
                <span>⏱ {a.time} min</span>
                <span>🏷 {a.topics.join(', ')}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                a.type === 'coding'
                  ? (window.location.href = '/student/code')
                  : setActiveQuiz(a)
              }
            >
              {a.type === 'coding' ? 'Open Editor →' : 'Start Test →'}
            </button>
          </div>
        ))}
      </div>
    </ProtectedLayout>
  );
}
