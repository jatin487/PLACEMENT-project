const mongoose = require('mongoose');
const Company = require('../models/Company');

// Fields jo client se accept honge (mass-assignment se bachne ke liye)
const ALLOWED_FIELDS = [
  'name',
  'logo',
  'website',
  'description',
  'industry',
  'location',
  'jobRoles',
  'eligibility',
  'package',
  'isActive',
];

const pick = (obj = {}, keys = []) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

// Agar jobRoles / eligibility separate collection ke refs hain to populate honge,
// embedded hain to skip ho jayenge.
const getPopulatePaths = () =>
  ['jobRoles', 'eligibility'].filter((p) => {
    const path = Company.schema.path(p);
    return path && (path.options?.ref || path.caster?.options?.ref);
  });

// @desc    Saari companies ki list
// @route   GET /api/companies?search=&industry=&page=&limit=
// @access  Private
exports.getCompanies = async (req, res) => {
  try {
    const { search, industry } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = {};
    if (search) {
      filter.name = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }
    if (industry) filter.industry = industry;

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: companies.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: companies,
    });
  } catch (err) {
    console.error('getCompanies error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching companies' });
  }
};

// @desc    Company detail (job roles + eligibility ke saath)
// @route   GET /api/companies/:id
// @access  Private
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' });
    }

    let query = Company.findById(id);
    getPopulatePaths().forEach((p) => {
      query = query.populate(p);
    });

    const company = await query;
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: company });
  } catch (err) {
    console.error('getCompanyById error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching company' });
  }
};

// @desc    Nai company add karo
// @route   POST /api/companies
// @access  Private/Admin
exports.createCompany = async (req, res) => {
  try {
    const data = pick(req.body, ALLOWED_FIELDS);

    if (!data.name || !String(data.name).trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }
    data.name = String(data.name).trim();

    const existing = await Company.findOne({
      name: { $regex: `^${data.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Company with this name already exists' });
    }

    const company = await Company.create(data);
    res.status(201).json({ success: true, message: 'Company created', data: company });
  } catch (err) {
    console.error('createCompany error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map((e) => e.message).join(', '),
      });
    }
    res.status(500).json({ success: false, message: 'Server error while creating company' });
  }
};

// @desc    Company update karo
// @route   PUT /api/companies/:id
// @access  Private/Admin
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' });
    }

    const updates = pick(req.body, ALLOWED_FIELDS);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }
    if (updates.name !== undefined) {
      updates.name = String(updates.name).trim();
      if (!updates.name) {
        return res.status(400).json({ success: false, message: 'Company name cannot be empty' });
      }
    }

    const company = await Company.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, message: 'Company updated', data: company });
  } catch (err) {
    console.error('updateCompany error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map((e) => e.message).join(', '),
      });
    }
    res.status(500).json({ success: false, message: 'Server error while updating company' });
  }
};