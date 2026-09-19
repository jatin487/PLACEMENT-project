const CodingProblem = require('../models/CodingProblem');

exports.getProblems = async (req, res) => {
  try {
    const { difficulty, tags } = req.query;
    const filter = {};

    if (difficulty) {
      filter.difficulty = String(difficulty).trim().toLowerCase();
    }

    if (tags) {
      // tags can be sent as comma-separated string: ?tags=array,dp
      const tagList = String(tags)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (tagList.length > 0) {
        filter.tags = { $in: tagList };
      }
    }

    const problems = await CodingProblem.find(filter)
      .select('-testCases') // don't leak test cases in list view
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch problems', error: error.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // First 2 test cases are shown to the user as "examples", full list still returned for the code editor
    const examples = (problem.testCases || []).slice(0, 2);

    res.status(200).json({
      success: true,
      problem,
      examples,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch problem', error: error.message });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (!['admin', 'faculty'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only admin or faculty can create problems' });
    }

    const { title, statement, difficulty, tags, testCases } = req.body;

    if (!title || !statement || !difficulty || !testCases) {
      return res.status(400).json({
        success: false,
        message: 'title, statement, difficulty and testCases are required',
      });
    }

    const problem = await CodingProblem.create({
      title,
      statement,
      difficulty: String(difficulty).trim().toLowerCase(),
      tags: tags || [],
      testCases,
    });

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      problem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create problem', error: error.message });
  }
};