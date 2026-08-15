/**
 * ProctoringMonitor — Behavioral webcam proctoring component
 *
 * Detects the following violations (no heavy CV library required):
 *   - TAB_SWITCH       — candidate leaves the browser tab
 *   - WINDOW_BLUR      — candidate alt-tabs or clicks outside
 *   - FULLSCREEN_EXIT  — fullscreen is exited during assessment
 *   - COPY_PASTE       — Ctrl+C / Ctrl+V during assessment
 *   - CONTEXT_MENU     — right-click during assessment
 *
 * Shows:
 *   - A live webcam preview (corner thumbnail)
 *   - A violation warning banner after each event
 *   - A progress bar showing remaining violation budget
 *
 * Does NOT directly write to Firestore — all violations go through
 * the reportViolation() callback supplied by useProctoringSession.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const VIOLATION_CONFIGS = {
  TAB_SWITCH:      { label: 'Tab Switch Detected',        severity: 'high',   emoji: '👁️',  color: '#ef4444' },
  WINDOW_BLUR:     { label: 'Window Lost Focus',          severity: 'medium', emoji: '🖥️',  color: '#f59e0b' },
  FULLSCREEN_EXIT: { label: 'Fullscreen Exited',          severity: 'medium', emoji: '⛶',   color: '#f59e0b' },
  COPY_PASTE:      { label: 'Copy/Paste Detected',        severity: 'high',   emoji: '📋',  color: '#ef4444' },
  CONTEXT_MENU:    { label: 'Right-click Detected',       severity: 'low',    emoji: '🖱️',  color: '#8b5cf6' },
};

export default function ProctoringMonitor({
  sessionId,
  violationCount,
  maxViolations,
  isCancelled,
  onViolation,
  webcamEnabled = true,
}) {
  const videoRef        = useRef(null);
  const streamRef       = useRef(null);
  const [camReady, setCamReady]             = useState(false);
  const [camError, setCamError]             = useState(null);
  const [warning, setWarning]               = useState(null);  // { type, label, emoji, color }
  const [warningVisible, setWarningVisible] = useState(false);

  // ── Webcam Setup ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!webcamEnabled || isCancelled) return;

    let active = true;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCamReady(true);
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[ProctoringMonitor] Webcam unavailable:', err.message);
        setCamError('Webcam unavailable');
      });

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [webcamEnabled, isCancelled]);

  // ── Show violation warning banner ───────────────────────────────────────────

  const triggerWarning = useCallback((type) => {
    const cfg = VIOLATION_CONFIGS[type];
    if (!cfg) return;
    setWarning({ type, ...cfg });
    setWarningVisible(true);

    // Auto-dismiss after 4 seconds
    setTimeout(() => setWarningVisible(false), 4000);

    // Notify parent (useProctoringSession.reportViolation)
    onViolation?.(type, cfg.severity, cfg.label);
  }, [onViolation]);

  // ── Behavioral Detectors ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!sessionId || isCancelled) return;

    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) triggerWarning('TAB_SWITCH');
    };

    // Window blur (alt-tab, browser minimized)
    const handleBlur = () => triggerWarning('WINDOW_BLUR');

    // Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement &&
          !document.webkitFullscreenElement &&
          !document.mozFullScreenElement) {
        triggerWarning('FULLSCREEN_EXIT');
      }
    };

    // Copy / paste prevention
    const handleCopy  = (e) => { e.preventDefault(); triggerWarning('COPY_PASTE'); };
    const handlePaste = (e) => { e.preventDefault(); triggerWarning('COPY_PASTE'); };

    // Right-click prevention
    const handleContextMenu = (e) => { e.preventDefault(); triggerWarning('CONTEXT_MENU'); };

    // Keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+A, PrintScreen)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        if (['c', 'v'].includes(e.key.toLowerCase())) triggerWarning('COPY_PASTE');
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerWarning('COPY_PASTE');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sessionId, isCancelled, triggerWarning]);

  // ── Violation budget display ─────────────────────────────────────────────────

  const remaining     = Math.max(0, maxViolations - violationCount);
  const budgetPercent = Math.max(0, ((maxViolations - violationCount) / maxViolations) * 100);
  const budgetColor   = budgetPercent > 60 ? '#10b981' : budgetPercent > 30 ? '#f59e0b' : '#ef4444';

  return (
    <>
      {/* ── Violation Warning Banner ─────────────────────────────────────── */}
      {warningVisible && warning && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            background: `linear-gradient(135deg, ${warning.color}ee, ${warning.color}aa)`,
            color: '#fff',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: `0 4px 24px ${warning.color}66`,
            animation: 'slideDown 0.3s ease',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>{warning.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>⚠️ {warning.label}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 400, marginTop: '2px' }}>
              {remaining > 1
                ? `${remaining - 1} warning${remaining - 2 !== 1 ? 's' : ''} remaining before automatic cancellation`
                : remaining === 1
                ? '🚨 Final warning! Next violation will cancel your assessment.'
                : 'Threshold reached — session is being cancelled.'}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '0.78rem',
            whiteSpace: 'nowrap',
          }}>
            {violationCount + 1}/{maxViolations}
          </div>
          <button
            onClick={() => setWarningVisible(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}

      {/* ── Proctoring Status Bar ────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'flex-end',
      }}>
        {/* Webcam Thumbnail */}
        {webcamEnabled && (
          <div style={{
            width: '160px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `2px solid ${camReady ? '#10b981' : '#ef4444'}`,
            background: '#0a0a0f',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
            {camReady ? (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '0.65rem',
                  color: '#10b981',
                  fontWeight: 700,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulse-glow 1.5s infinite',
                    display: 'inline-block',
                  }} />
                  LIVE
                </div>
              </>
            ) : (
              <div style={{
                height: '90px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: '#ef4444',
                fontSize: '0.75rem',
              }}>
                <span style={{ fontSize: '1.5rem' }}>📵</span>
                <span>{camError || 'Camera off'}</span>
              </div>
            )}
          </div>
        )}

        {/* Violation Budget Card */}
        <div style={{
          background: 'rgba(15,15,26,0.95)',
          border: `1px solid ${budgetColor}44`,
          borderRadius: '12px',
          padding: '10px 14px',
          width: '160px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              🛡️ PROCTORED
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: budgetColor,
            }}>
              {violationCount}/{maxViolations}
            </span>
          </div>

          {/* Budget bar */}
          <div style={{
            height: '4px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '6px',
          }}>
            <div style={{
              height: '100%',
              width: `${budgetPercent}%`,
              background: budgetColor,
              borderRadius: '4px',
              transition: 'width 0.5s ease, background 0.5s ease',
            }} />
          </div>

          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {remaining > 0
              ? `${remaining} warning${remaining !== 1 ? 's' : ''} left`
              : '⚠️ Final warning reached'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </>
  );
}
