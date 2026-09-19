const Notification = require('../models/Notification');

// @desc    Get user notifications (unread first)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    // Sort unread first (isRead: false comes before isRead: true), then latest first
    const notifications = await Notification.find({ userId }).sort({ isRead: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read or PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read for logged in user
// @route   PATCH /api/notifications/read-all or PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const targetUserId = userId || req.user.id || req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const notification = await Notification.create({
      userId: targetUserId,
      message,
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};
