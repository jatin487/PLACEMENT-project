const User = require("../models/User");
const Analytics = require("../models/Analytics");
const Submission = require("../models/Submission");
const Achievement = require("../models/Achievement");

exports.getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Analytics model imported for future analytics-related data.
    // eslint-disable-next-line no-unused-vars
    const analyticsModel = Analytics;

    const [testsCompleted, badgesEarned, recentActivity] = await Promise.all([
      Submission.countDocuments({ studentId: userId }),
      Achievement.countDocuments({ userId: userId }),
      Submission.find({ studentId: userId })
        .sort({ createdAt: -1 })
        .limit(4)
        .select("verdict language createdAt score"),
    ]);

    // Get submissions from the last 7 days.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklySubmissions = await Submission.find({
      studentId: userId,
      createdAt: { $gte: sevenDaysAgo },
    }).select("score createdAt");

    // Prepare all 7 days, including days with no submissions.
    const weeklyMap = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);

      const key = date.toISOString().split("T")[0];

      weeklyMap[key] = {
        date: key,
        totalScore: 0,
        submissions: 0,
      };
    }

    weeklySubmissions.forEach((submission) => {
      const key = submission.createdAt.toISOString().split("T")[0];

      if (weeklyMap[key]) {
        weeklyMap[key].totalScore += Number(submission.score) || 0;
        weeklyMap[key].submissions += 1;
      }
    });

    const weeklyActivity = Object.values(weeklyMap).map((day) => ({
      date: day.date,
      averageScore:
        day.submissions > 0
          ? Number((day.totalScore / day.submissions).toFixed(2))
          : 0,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        coursesEnrolled: 0,
        testsCompleted,
        skillPoints: user.skillPoints || 0,
        badgesEarned,
      },
      recentActivity,
      weeklyActivity,
      radarData: [],
    });
  } catch (error) {
    console.error("Get analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};
