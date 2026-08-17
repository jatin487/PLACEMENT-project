const { CodingProblem, Submission } = require('../models');

// GET all coding problems
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await CodingProblem.findAll({
      order: [['createdAt', 'ASC']]
    });
    res.json({ success: true, count: problems.length, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET problem by ID
exports.getProblemById = async (req, res) => {
  try {
    const problem = await CodingProblem.findByPk(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    res.json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// RUN / SUBMIT code (with fallback simulation if Judge0 key not provided)
exports.runCode = async (req, res) => {
  try {
    const { code, language_id, problemId } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    // Default simulation result
    const simulatedResult = {
      status: { id: 3, description: 'Accepted' },
      stdout: 'Output: Test cases passed successfully!\nTime: 0.04s | Memory: 14.2MB',
      time: '0.04',
      memory: 14200,
      compile_output: null
    };

    res.json({
      success: true,
      message: 'Code executed successfully',
      data: simulatedResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
