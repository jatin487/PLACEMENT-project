const { User, StudentProfile, Analytics, Achievement, Notification } = require('../models');

// GET Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'department', 'batch', 'skillPoints', 'streak'],
      order: [['skillPoints', 'DESC']],
      limit: 50
    });

    const leaderboard = students.map((s, idx) => ({
      rank: idx + 1,
      id: s.id,
      name: s.name,
      email: s.email,
      department: s.department || 'CSE',
      batch: s.batch || '2025',
      skillPoints: s.skillPoints || 0,
      streak: s.streak || 1,
      problemsSolved: Math.floor((s.skillPoints || 0) / 35),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`
    }));

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET My Analytics
exports.getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [
        { model: StudentProfile },
        { model: Analytics },
        { model: Achievement }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET Badges
exports.getMyBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await Achievement.findAll({ where: { userId } });
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET Notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark Notification as Read
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.update({ read: true }, { where: { id } });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
