const User = require('../models/User');

/**
 * Build a date filter based on the `period` query param.
 * Uses createdAt as the time axis for filtering.
 */
const buildDateFilter = (period) => {
  const now = new Date();

  if (period === 'thisWeek') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return { createdAt: { $gte: startOfWeek } };
  }

  if (period === 'thisMonth') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { createdAt: { $gte: startOfMonth } };
  }

  // 'allTime' or any other value — no date filter
  return {};
};

// ─── GET /api/leaderboard ────────────────────────────────────────────────────
/**
 * Returns students ranked by skillPoints (highest first).
 * Query params:
 *   ?department=CSE                          → filter by department (case-insensitive)
 *   ?period=thisWeek | thisMonth | allTime   → filter by registration period (default: allTime)
 *   ?limit=50                                → max results returned (default: 50)
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { department, period = 'allTime', limit = 50 } = req.query;

    // Only students appear on the leaderboard
    const filter = { role: 'student' };

    // Department filter (case-insensitive exact match)
    if (department && department.trim()) {
      filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
    }

    // Time period filter
    Object.assign(filter, buildDateFilter(period));

    const users = await User.find(filter, '-password')
      .sort({ skillPoints: -1, streak: -1 }) // secondary sort by streak for tie-breaking
      .limit(parseInt(limit, 10))
      .lean();

    // Attach rank to each entry
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department || 'N/A',
      batch: user.batch || 'N/A',
      skillPoints: user.skillPoints,
      streak: user.streak,
      lastActive: user.lastActive,
    }));

    return res.json({
      success: true,
      period,
      department: department || 'All',
      total: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/leaderboard/me ─────────────────────────────────────────────────
/**
 * Returns the current authenticated user's rank and stats on the leaderboard.
 * Accepts the same ?department and ?period filters for contextual rank calculation.
 */
exports.getMyRank = async (req, res) => {
  try {
    const { department, period = 'allTime' } = req.query;

    // Fetch current user
    const currentUser = await User.findById(req.user.id, '-password').lean();
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Build the same filter as the main leaderboard
    const filter = { role: 'student' };
    if (department && department.trim()) {
      filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
    }
    Object.assign(filter, buildDateFilter(period));

    // Rank = (number of users with MORE points) + 1
    const higherCount = await User.countDocuments({
      ...filter,
      skillPoints: { $gt: currentUser.skillPoints },
    });

    const rank = higherCount + 1;
    const totalParticipants = await User.countDocuments(filter);

    // Percentile (higher = better)
    const percentile =
      totalParticipants > 0
        ? Math.round(((totalParticipants - rank + 1) / totalParticipants) * 100)
        : 100;

    return res.json({
      success: true,
      period,
      department: department || 'All',
      rank,
      totalParticipants,
      percentile,
      user: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department || 'N/A',
        batch: currentUser.batch || 'N/A',
        skillPoints: currentUser.skillPoints,
        streak: currentUser.streak,
        lastActive: currentUser.lastActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
