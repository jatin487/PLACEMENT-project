import { useState } from 'react';
import Editor from '@monaco-editor/react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { LANGUAGES, CODE_TEMPLATES } from '../../data/seedData';
import { quizAPI } from '../../services/api';

const CODING_PROBLEMS = [
  {
    id: 1, title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'HashMap'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
  },
  {
    id: 2, title: 'Reverse String', difficulty: 'Easy', tags: ['String', 'Recursion'],
    description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: '' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁵', 's[i] is a printable ASCII character.'],
  },
  {
    id: 3, title: 'Valid Parentheses', difficulty: 'Medium', tags: ['Stack', 'String'],
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: '' },
      { input: 's = "()[]{}"', output: 'true', explanation: '' },
      { input: 's = "(]"', output: 'false', explanation: '' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', "s consists of parentheses only '()[]{}'."],
  },
];

export default function CodeEditorPage() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(CODE_TEMPLATES[LANGUAGES[0].id]);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('// Your output will appear here...');
  const [running, setRunning] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(CODING_PROBLEMS[0]);
  const [activeTab, setActiveTab] = useState('description');

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setCode(CODE_TEMPLATES[lang.id]);
  };

  const runCode = async () => {
    setRunning(true);
    setOutput('⏳ Running your code...');
    try {
      const res = await quizAPI.runCode({ code, language_id: selectedLang.id, stdin, language: selectedLang.name });
      const data = res.data;
      const out = data.stdout || data.stderr || data.compile_output || '(no output)';
      setOutput(`Status: ${data.status?.description || 'Unknown'}\nTime: ${data.time || '?'}s\n\n${out}`);
    } catch {
      setOutput(`// Code execution requires the backend server to be running.\n// Start the server with: cd server && npm run dev\n\n// Mock output for demo:\nHello, World!\n[0, 1]`);
    } finally {
      setRunning(false);
    }
  };

  const diffColor = { Easy: 'var(--color-accent)', Medium: 'var(--color-warning)', Hard: 'var(--color-danger)' };

  return (
    <ProtectedLayout title="Code Editor" allowedRoles={['student']}>
      <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 128px)', overflow: 'hidden' }}>

        {/* Left — Problem Panel */}
        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {/* Problem List */}
          <div className="card" style={{ padding: '12px' }}>
            <div className="font-bold text-sm" style={{ marginBottom: '10px' }}>🧩 Problems</div>
            {CODING_PROBLEMS.map((p) => (
              <div key={p.id} onClick={() => setSelectedProblem(p)}
                style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: selectedProblem.id === p.id ? 'var(--color-primary-glow)' : 'transparent',
                  border: `1px solid ${selectedProblem.id === p.id ? 'var(--border-accent)' : 'transparent'}`,
                  marginBottom: '4px', transition: 'all 0.15s',
                }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{p.title}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: diffColor[p.difficulty] }}>{p.difficulty}</span>
                </div>
                <div className="flex gap-xs" style={{ marginTop: '4px' }}>
                  {p.tags.map(t => <span key={t} className="badge badge-muted" style={{ fontSize: '0.6rem' }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* Problem Description */}
          <div className="card" style={{ flex: 1 }}>
            <div className="flex gap-sm" style={{ marginBottom: '16px' }}>
              {['description', 'examples'].map(t => (
                <button key={t} className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>

            <div className="flex items-center gap-sm" style={{ marginBottom: '12px' }}>
              <span className="font-bold text-lg">{selectedProblem.title}</span>
              <span className="badge" style={{ color: diffColor[selectedProblem.difficulty], background: `${diffColor[selectedProblem.difficulty]}22`, border: `1px solid ${diffColor[selectedProblem.difficulty]}44` }}>
                {selectedProblem.difficulty}
              </span>
            </div>
            <div className="flex gap-xs" style={{ marginBottom: '16px' }}>
              {selectedProblem.tags.map(t => <span key={t} className="badge badge-primary">{t}</span>)}
            </div>

            {activeTab === 'description' ? (
              <>
                <p className="text-sm" style={{ lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                  {selectedProblem.description}
                </p>
                <div className="font-semibold text-sm" style={{ marginBottom: '8px' }}>Constraints:</div>
                {selectedProblem.constraints.map((c, i) => (
                  <div key={i} className="text-xs text-muted" style={{ marginBottom: '4px' }}>• {c}</div>
                ))}
              </>
            ) : (
              selectedProblem.examples.map((ex, i) => (
                <div key={i} className="card" style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-elevated)' }}>
                  <div className="font-semibold text-xs" style={{ marginBottom: '8px' }}>Example {i + 1}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', lineHeight: 1.8 }}>
                    <div><span className="text-muted">Input: </span><span style={{ color: 'var(--color-accent)' }}>{ex.input}</span></div>
                    <div><span className="text-muted">Output: </span><span style={{ color: 'var(--color-primary-light)' }}>{ex.output}</span></div>
                    {ex.explanation && <div><span className="text-muted">Explanation: </span>{ex.explanation}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — Editor Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
          {/* Editor Header */}
          <div className="code-editor-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="code-editor-header">
              <div className="flex items-center gap-sm">
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                    <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span className="text-xs text-muted">solution.{selectedLang.ext}</span>
              </div>

              <div className="flex items-center gap-sm">
                <select value={selectedLang.id}
                  onChange={(e) => handleLangChange(LANGUAGES.find(l => l.id === parseInt(e.target.value)))}
                  style={{
                    background: 'var(--bg-glass)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)', padding: '4px 10px', color: 'var(--text-primary)',
                    fontSize: '0.75rem', cursor: 'pointer',
                  }}>
                  {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <button className="btn btn-accent btn-sm" onClick={runCode} disabled={running}>
                  {running ? '⏳ Running...' : '▶ Run Code'}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Editor
                height="100%"
                language={selectedLang.name.toLowerCase().includes('python') ? 'python' : selectedLang.name.toLowerCase().includes('java') && !selectedLang.name.includes('Script') ? 'java' : selectedLang.name.toLowerCase().includes('c++') ? 'cpp' : 'javascript'}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false,
                  fontFamily: "'JetBrains Mono', monospace", lineNumbers: 'on',
                  bracketPairColorization: { enabled: true }, padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>

          {/* Stdin + Output */}
          <div className="grid grid-2" style={{ gap: '12px', height: 160, flexShrink: 0 }}>
            <div className="code-editor-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="code-editor-header">
                <span className="text-xs text-muted">📥 Custom Input (stdin)</span>
              </div>
              <textarea value={stdin} onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter test input here..."
                style={{
                  flex: 1, background: '#0d1117', border: 'none', padding: '12px',
                  color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem',
                  resize: 'none', outline: 'none',
                }} />
            </div>
            <div className="code-editor-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="code-editor-header">
                <span className="text-xs text-muted">📤 Output</span>
                <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }} onClick={() => setOutput('')}>Clear</button>
              </div>
              <div className="code-output" style={{ flex: 1 }}>{output}</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
