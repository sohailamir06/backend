const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

exports.registerCompany = asyncHandler(async (req, res) => {
  const result = await authService.registerCompany(req.body);

  res.status(201).json({
    status: "success",
    data: result,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.me = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user);

  res.status(200).json({
    status: "success",
    data: result,
  });
});
