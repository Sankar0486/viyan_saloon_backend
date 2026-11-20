
const companyService = require("../services/company.service");

exports.create = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(
      req.body,
      req.auth.id
    );

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const result = await companyService.listCompanies(req.query);

    res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const company = await companyService.getCompany(
      req.params.companyId
    );

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(
      req.params.companyId,
      req.body,
      req.auth.id
    );

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

exports.status = async (req, res, next) => {
  try {
    const company = await companyService.setCompanyStatus(
      req.params.companyId,
      req.body.isActive,
      req.auth.id
    );

    res.status(200).json({
      success: true,
      message: "Company status updated successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

exports.dropdown = async (req, res, next) => {
  try {
    const companies = await companyService.getCompanyDropdown();

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};
