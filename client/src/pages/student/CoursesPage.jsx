import { useState, useEffect } from "react";
import ProtectedLayout from "../../components/layout/ProtectedLayout";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const categories = ["All", "Technical", "Professional", "Project"];

const COMPANY_TRACKS = [
  {
    id: "tcs",
    name: "TCS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    cover:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    modules: 14,
  },
  {
    id: "infosys",
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    cover:
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=600&q=80",
    modules: 18,
  },
  {
    id: "wipro",
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
    cover:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    modules: 12,
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    cover:
      "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=600&q=80",
    modules: 25,
  },
  {
    id: "google",
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    cover:
      "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=600&q=80",
    modules: 30,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    cover:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    modules: 22,
  },
];

const CATEGORY_META = {
  dsa: {
    icon: "🧮",
    color: "#6366f1",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
  },
  dbms: {
    icon: "🗄️",
    color: "#8b5cf6",
    image:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80",
  },
  default: {
    icon: "📚",
    color: "#6366f1",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  },
};

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrolledRes] = await Promise.all([
          API.get("/courses"),
          API.get("/courses/enrolled"),
        ]);
        setCourses(coursesRes.data.courses || []);
        setEnrollments(enrolledRes.data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProgress = (courseId) => {
    const enrollment = enrollments.find((e) => e._id === courseId);
    return enrollment ? enrollment.progress : 0;
  };

  const getMeta = (title) => {
    const key = title?.toLowerCase().split(" ")[0];
    return CATEGORY_META[key] || CATEGORY_META.default;
  };

  const filtered = courses.filter((c) => {
    const matchCat =
      activeCategory === "All" ||
      c.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ProtectedLayout title="Training Modules" allowedRoles={["student"]}>
      <div className="page-header">
        <h1 className="page-title">Training Modules 📚</h1>
        <p className="page-subtitle">
          Master technical fundamentals, professional skills, and domain
          projects.
        </p>
      </div>

      {/* Filters */}
      <div
        className="card animate-fadeInUp"
        style={{ marginBottom: "24px", padding: "16px" }}
      >
        <div className="flex items-center gap-md" style={{ flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              className="form-input"
              placeholder="🔍 Search modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "10px 14px" }}
            />
          </div>
          <div className="flex gap-sm" style={{ flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button
                key={c}
                className={`btn btn-sm ${activeCategory === c ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="flex items-center justify-center"
          style={{ padding: "60px" }}
        >
          <p className="text-muted">Loading modules...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div
          className="flex items-center justify-center"
          style={{ padding: "60px" }}
        >
          <p className="text-muted">No modules found.</p>
        </div>
      )}

      {/* Module Cards */}
      {!loading && filtered.length > 0 && (
        <div
          className="grid grid-auto animate-fadeInUp animate-delay-1"
          style={{ marginBottom: "32px" }}
        >
          {filtered.map((course, i) => {
            const meta = getMeta(course.title);
            const progress = getProgress(course._id);
            return (
              <div
                key={course._id}
                className={`course-card animate-delay-${(i % 4) + 1}`}
                onClick={() => navigate(`/student/courses/${course._id}`)}
              >
                <div
                  className="course-card-header"
                  style={{
                    position: "relative",
                    height: 140,
                    overflow: "hidden",
                    borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                    background: "#0f172a",
                  }}
                >
                  <img
                    src={meta.image}
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: 0.75,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)",
                    }}
                  />
                  <span
                    className="badge badge-primary"
                    style={{ position: "absolute", top: 12, right: 12 }}
                  >
                    {course.category || "technical"}
                  </span>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                    }}
                  >
                    {meta.icon}
                  </div>
                </div>
                <div className="course-card-body">
                  <div className="course-card-title">{course.title}</div>
                  <div className="course-card-desc">{course.description}</div>
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      className="flex items-center justify-between text-xs text-muted"
                      style={{ marginBottom: "4px" }}
                    >
                      <span>Progress</span>
                      <span style={{ color: meta.color }}>{progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)`,
                        }}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm w-full">
                    Continue Learning →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Company Tracks — same as before */}
      <div className="animate-fadeInUp animate-delay-2">
        <div className="flex items-center justify-between mb-md">
          <h2 className="text-xl font-bold">🏢 Company-Specific Tracks</h2>
          <span className="badge badge-accent">Professional</span>
        </div>
        <div className="grid grid-3">
          {COMPANY_TRACKS.map((c) => (
            <div
              key={c.id}
              className="card"
              style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}
              onClick={() => navigate("/student/assessments")}
            >
              <div
                style={{
                  height: 100,
                  position: "relative",
                  background: "#0f172a",
                  overflow: "hidden",
                }}
              >
                <img
                  src={c.cover}
                  alt={c.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.65,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: "#ffffff",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={c.logo}
                    alt={c.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
              <div style={{ padding: "28px 16px 16px", textAlign: "center" }}>
                <div className="font-bold text-lg">{c.name}</div>
                <div className="text-xs text-muted">
                  Placement Track · {c.modules} Practice Tests
                </div>
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <button className="btn btn-primary btn-sm w-full">
                  Start Track →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
