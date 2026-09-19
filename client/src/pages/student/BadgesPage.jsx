import { useState, useEffect } from "react";
import ProtectedLayout from "../../components/layout/ProtectedLayout";
import API from "../../services/api";

export default function BadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [allRes, myRes] = await Promise.all([
          API.get("/achievements/all"),
          API.get("/achievements/me"),
        ]);
        setAllBadges(allRes.data.achievements || []);
        setEarnedBadges(myRes.data.achievements || []);
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const earnedTitles = new Set(earnedBadges.map((b) => b.title));
  const lockedBadges = allBadges.filter((b) => !earnedTitles.has(b.title));
  const earnedCount = earnedBadges.length;
  const totalCount = allBadges.length;

  return (
    <ProtectedLayout title="My Badges" allowedRoles={["student"]}>
      <div className="page-header">
        <h1 className="page-title">🏅 My Badges</h1>
        <p className="page-subtitle">
          Collect badges by completing modules, passing tests, and maintaining
          streaks.
        </p>
      </div>

      {/* Progress */}
      <div
        className="card animate-fadeInUp"
        style={{
          marginBottom: "24px",
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.06) 100%)",
          border: "1px solid rgba(245,158,11,0.25)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: "12px" }}
        >
          <div>
            <div className="font-bold text-xl">
              {earnedCount} / {totalCount} Badges Earned
            </div>
            <div className="text-muted text-sm">
              {totalCount - earnedCount} more to unlock
            </div>
          </div>
          <div style={{ fontSize: "3rem" }}>🏅</div>
        </div>
        <div className="progress-bar-container" style={{ height: "8px" }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`,
              background: "var(--gradient-warm)",
            }}
          />
        </div>
        <div className="text-xs text-muted" style={{ marginTop: "6px" }}>
          {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
          complete
        </div>
      </div>

      {loading && (
        <div
          className="flex items-center justify-center"
          style={{ padding: "60px" }}
        >
          <p className="text-muted">Loading badges...</p>
        </div>
      )}

      {/* Earned Badges */}
      {!loading && (
        <div
          className="animate-fadeInUp animate-delay-1"
          style={{ marginBottom: "32px" }}
        >
          <h2 className="text-xl font-bold" style={{ marginBottom: "16px" }}>
            ✅ Earned Badges{" "}
            <span className="badge badge-accent" style={{ marginLeft: "8px" }}>
              {earnedCount}
            </span>
          </h2>
          {earnedBadges.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "40px" }}
            >
              <p className="text-muted">
                No badges earned yet — start completing modules and tests!
              </p>
            </div>
          ) : (
            <div className="grid grid-4">
              {earnedBadges.map((b, i) => (
                <div
                  key={b.id}
                  className={`achievement-badge earned animate-delay-${(i % 4) + 1}`}
                  style={{ padding: "24px 16px", cursor: "default" }}
                >
                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "8px",
                      animation: "float 4s ease-in-out infinite",
                    }}
                  >
                    {b.icon || "🏅"}
                  </div>
                  <div
                    className="achievement-name"
                    style={{ fontSize: "0.875rem", marginBottom: "4px" }}
                  >
                    {b.title}
                  </div>
                  <div
                    className="achievement-desc"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {b.description}
                  </div>
                  <div
                    className="badge badge-warning"
                    style={{ marginTop: "8px", fontSize: "0.65rem" }}
                  >
                    Earned ✓
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Locked Badges */}
      {!loading && (
        <div className="animate-fadeInUp animate-delay-2">
          <h2 className="text-xl font-bold" style={{ marginBottom: "16px" }}>
            🔒 Locked Badges{" "}
            <span className="badge badge-muted" style={{ marginLeft: "8px" }}>
              {lockedBadges.length}
            </span>
          </h2>
          <div className="grid grid-4">
            {lockedBadges.map((b, i) => (
              <div
                key={b.id}
                className={`achievement-badge animate-delay-${(i % 4) + 1}`}
                style={{
                  padding: "24px 16px",
                  cursor: "default",
                  opacity: 0.45,
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "8px",
                    filter: "grayscale(1)",
                  }}
                >
                  {b.icon || "🔒"}
                </div>
                <div
                  className="achievement-name"
                  style={{ fontSize: "0.875rem", marginBottom: "4px" }}
                >
                  {b.title}
                </div>
                <div
                  className="achievement-desc"
                  style={{ fontSize: "0.75rem" }}
                >
                  {b.description}
                </div>
                <div
                  className="badge badge-muted"
                  style={{ marginTop: "8px", fontSize: "0.65rem" }}
                >
                  🔒 Locked
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How to Earn */}
      <div
        className="card animate-fadeInUp animate-delay-3"
        style={{ marginTop: "32px" }}
      >
        <h3 className="font-bold text-lg" style={{ marginBottom: "16px" }}>
          💡 How to Earn Badges
        </h3>
        <div className="grid grid-2" style={{ gap: "12px" }}>
          {[
            {
              icon: "📚",
              tip: "Complete training modules to unlock subject-specific badges.",
            },
            {
              icon: "📝",
              tip: "Score 90%+ on quizzes to earn Quiz Champion and similar badges.",
            },
            {
              icon: "🔥",
              tip: "Maintain daily coding streaks for Week Warrior and Month Warrior.",
            },
            {
              icon: "🎯",
              tip: "Finish mock placement tests to unlock Mock Expert badge.",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="flex items-start gap-md"
              style={{
                padding: "12px",
                background: "var(--bg-glass)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>
                {t.icon}
              </span>
              <p className="text-sm text-secondary">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
