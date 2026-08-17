const { Assessment, Submission } = require('../models');

// GET all assessments / quizzes
exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET assessment by ID
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findByPk(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CREATE assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, type, questions, totalScore } = req.body;
    const assessment = await Assessment.create({
      title,
      type: type || 'mcq',
      questions: questions || [],
      totalScore: totalScore || (questions ? questions.length : 10),
    });
    res.status(201).json({ success: true, message: 'Assessment created successfully', data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// SUBMIT assessment
exports.submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, score, code, language } = req.body;
    const studentId = req.user?.id;

    const assessment = await Assessment.findByPk(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    let calculatedScore = score;
    // Calculate MCQ score if questions are available
    if (assessment.type === 'mcq' && assessment.questions && answers) {
      let correct = 0;
      assessment.questions.forEach((q, idx) => {
        const studentAns = answers[q.id || idx];
        if (studentAns && studentAns === q.correct_answer) {
          correct += (q.marks || 1);
        }
      });
      calculatedScore = correct;
    }

    if (studentId) {
      await Submission.create({
        studentId,
        score: calculatedScore || 0,
        status: 'evaluated',
        code: code || JSON.stringify(answers || {}),
        language: language || 'json',
      });
    }

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      score: calculatedScore,
      total: assessment.totalScore
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
