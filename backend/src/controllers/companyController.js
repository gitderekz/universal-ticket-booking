const { Company } = require('../models');

const slugify = (value) => {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const createCompany = async (req, res, next) => {
  try {
    const { name, description, category, logo_url, contact_email, contact_phone } = req.body;
    const company = await Company.create({
      owner_id: req.user.id,
      name,
      slug: slugify(name),
      description,
      category,
      logo_url,
      contact_email,
      contact_phone,
      status: 'pending'
    });
    res.status(201).json({ company });
  } catch (error) {
    next(error);
  }
};

const listCompanies = async (req, res, next) => {
  try {
    const companies = await Company.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json({ companies });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  listCompanies
};
