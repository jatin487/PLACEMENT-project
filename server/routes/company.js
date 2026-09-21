const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
} = require('../controllers/companyController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(protect, getCompanies).post(protect, adminOnly, createCompany);

router
  .route('/:id')
  .get(protect, getCompanyById)
  .put(protect, adminOnly, updateCompany);

module.exports = router;