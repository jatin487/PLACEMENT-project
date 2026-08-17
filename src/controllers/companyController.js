const { Company } = require('../models');

// GET all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
