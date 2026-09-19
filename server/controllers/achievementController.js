const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * NOTE: Achievement.js currently uses Sequelize (SQL) while the rest of the
 * project uses Mongoose (MongoDB).  To stay consistent with the existing stack
 * (User, Notification, Interview all use Mongoose), we define a Mongoose-based
 * Achievement model inline here.  If you later migrate Achievement.js to
 * Mongoose you can simply import that model instead.
 */

// ── Inline Mongoose Achievement Schema ────────────────────────────────────────
const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['badge', 'streak', 'certificate'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // e.g. { certificateUrl, streakCount }
      default: {},
    },
  },
  { timestamps: true }
);

// Prevent awarding the exact same badge twice to the same user
achievementSchema.index({ userId: 1, title: 1 }, { unique: true });

const Achievement =
  mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

// ── Available Badges Catalogue ────────────────────────────────────────────────
const ALL_BADGES = [
  {
    id: 'first_login',
    type: 'badge',
    title: 'First Login',
    description: 'Logged in for the first time.',
    icon: '🚀',
  },
  {
    id: 'streak_7',
    type: 'streak',
    title: '7-Day Streak',
    description: 'Maintained a 7-day login streak.',
    icon: '🔥',
  },
  {
    id: 'streak_30',
    type: 'streak',
    title: '30-Day Streak',
    description: 'Maintained a 30-day login streak.',
    icon: '🏅',
  },
  {
    id: 'top_10',
    type: 'badge',
    title: 'Top 10',
    description: 'Ranked in the top 10 on the leaderboard.',
    icon: '🏆',
  },
  {
    id: 'skill_100',
    type: 'badge',
    title: 'Skill Century',
    description: 'Earned 100 skill points.',
    icon: '💯',
  },
  {
    id: 'skill_500',
    type: 'badge',
    title: 'Skill Master',
    description: 'Earned 500 skill points.',
    icon: '⭐',
  },
  {
    id: 'placement_ready',
    type: 'certificate',
    title: 'Placement Ready',
    description: 'Completed all placement preparation modules.',
    icon: '🎓',
  },
  {
    id: 'problem_solver',
    type: 'badge',
    title: 'Problem Solver',
    description: 'Solved 10 coding problems.',
    icon: '💻',
  },
  {
    id: 'interview_ace',
    type: 'badge',
    title: 'Interview Ace',
    description: 'Completed 5 mock interviews.',
    icon: '🎯',
  },
  {
    id: 'early_bird',
    type: 'badge',
    title: 'Early Bird',
    description: 'Registered in the first batch of students.',
    icon: '🌅',
  },
];

// ─── GET /api/achievements/all ───────────────────────────────────────────────
/**
 * Returns the full catalogue of all available badges/achievements.
 * Public endpoint — no auth required.
 */
exports.getAllAchievements = (req, res) => {
  return res.json({
    success: true,
    total: ALL_BADGES.length,
    achievements: ALL_BADGES,
  });
};

// ─── GET /api/achievements/me ────────────────────────────────────────────────
/**
 * Returns all achievements earned by the currently authenticated user.
 */
exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with catalogue metadata (icon, etc.)
    const enriched = achievements.map((a) => {
      const catalogueEntry = ALL_BADGES.find((b) => b.title === a.title);
      return {
        id: a._id,
        type: a.type,
        title: a.title,
        description: a.description,
        metadata: a.metadata,
        icon: catalogueEntry?.icon || '🏅',
        earnedAt: a.createdAt,
      };
    });

    return res.json({
      success: true,
      total: enriched.length,
      achievements: enriched,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/achievements ──────────────────────────────────────────────────
/**
 * Awards a new achievement to a user.
 * Intended for internal/admin use.
 * Body: { userId, type, title, description?, metadata? }
 */
exports.awardAchievement = async (req, res) => {
  try {
    const { userId, type, title, description = '', metadata = {} } = req.body;

    // Basic validation
    if (!userId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'userId, type, and title are required.',
      });
    }

    if (!['badge', 'streak', 'certificate'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be one of: 'badge', 'streak', 'certificate'",
      });
    }

    // Verify user exists
    const user = await User.findById(userId, '-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check for duplicate (unique index will also catch this, but gives a clearer message)
    const existing = await Achievement.findOne({ userId, title });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `User already has the achievement: "${title}"`,
      });
    }

    const achievement = await Achievement.create({
      userId,
      type,
      title,
      description,
      metadata,
    });

    const catalogueEntry = ALL_BADGES.find((b) => b.title === title);

    return res.status(201).json({
      success: true,
      message: `Achievement "${title}" awarded to ${user.name}.`,
      achievement: {
        id: achievement._id,
        userId: achievement.userId,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        metadata: achievement.metadata,
        icon: catalogueEntry?.icon || '🏅',
        earnedAt: achievement.createdAt,
      },
    });
  } catch (error) {
    // Mongoose duplicate key error (unique index)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This achievement has already been awarded to this user.',
      });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};
