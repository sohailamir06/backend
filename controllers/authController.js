const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const config = require("../config/env");

const cookieName = "medistock_refresh";
function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.env === "production" || config.cookieSameSite === "none",
    sameSite: config.cookieSameSite,
    path: "/api",
    maxAge: config.refreshTokenExpiresDays * 86400000,
  };
}
function readCookie(req) {
  const item = (req.headers.cookie || "").split(";").map((v) => v.trim()).find((v) => v.startsWith(`${cookieName}=`));
  return item ? decodeURIComponent(item.slice(cookieName.length + 1)) : null;
}
function sendSession(res, result, status = 200) {
  res.cookie(cookieName, result.refreshToken, cookieOptions());
  const { refreshToken, ...data } = result;
  res.status(status).json({ status: "success", data });
}

exports.registerCompany = asyncHandler(async (req, res) => {
  const result = await authService.registerCompany(req.body);

  sendSession(res, result, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  sendSession(res, result);
});

exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = readCookie(req);
  if (!refreshToken) {
    return res.status(204).send();
  }
  return sendSession(res, await authService.refresh(refreshToken));
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(readCookie(req));
  res.clearCookie(cookieName, cookieOptions());
  res.status(204).send();
});

exports.me = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user);

  res.status(200).json({
    status: "success",
    data: result,
  });
});
