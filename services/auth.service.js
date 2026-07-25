const bcrypt = require("bcryptjs");
const Company = require("../models/Company");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { generateUniqueCompanyId } = require("../utils/companyId");
const { signAccessToken } = require("../utils/jwt");
const config = require("../config/env");
const seedService = require("./seed.service");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
async function issueRefreshToken(user, familyId = crypto.randomUUID()) {
  const token = crypto.randomBytes(48).toString("base64url");
  const tokenHash = hashToken(token);
  await RefreshToken.create({ tokenHash, familyId, userId: user._id, companyId: user.companyId,
    expiresAt: new Date(Date.now() + config.refreshTokenExpiresDays * 86400000) });
  return { token, tokenHash, familyId };
}

async function createSession(user, company) {
  const refresh = await issueRefreshToken(user);
  return { token: signAccessToken(user), refreshToken: refresh.token, user: user.toSafeObject(), company: toCompanyProfile(company) };
}

function toCompanyProfile(company) {
  return {
    id: company._id.toString(),
    companyId: company.companyId,
    companyName: company.companyName,
    industry: company.industry,
    country: company.country,
    status: company.status,
    settings: company.settings,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

async function registerCompany(payload) {
  const existingUser = await User.exists({ email: payload.email });

  if (existingUser) {
    throw new AppError("A user with this email already exists", 409);
  }

  let company;

  try {
    const companyId = await generateUniqueCompanyId();
    const passwordHash = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

    company = await Company.create({
      companyId,
      companyName: payload.companyName,
      industry: payload.industry,
      country: payload.country,
      settings: {
        general: {
          facilityName: payload.companyName,
          contactEmail: payload.email,
          phoneNumber: payload.phoneNumber,
        },
      },
    });

    const user = await User.create({
      companyId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      passwordHash,
      role: "company_admin",
      termsAcceptedAt: new Date(),
      newsletterSubscribed: payload.newsletterSubscribed,
    });

    await seedService.seedCompanyDefaults(companyId, user);

    return createSession(user, company);
  } catch (error) {
    if (company?.companyId) {
      await seedService.clearCompanyData(company.companyId).catch((cleanupError) => {
        console.error("Failed to clean up seeded company data after registration error:", cleanupError);
      });
      await User.deleteMany({ companyId: company.companyId }).catch((cleanupError) => {
        console.error("Failed to clean up users after registration error:", cleanupError);
      });
    }

    if (company?._id) {
      await Company.deleteOne({ _id: company._id }).catch((cleanupError) => {
        console.error("Failed to clean up company after registration error:", cleanupError);
      });
    }

    throw error;
  }
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials", 401);
  }

  const company = await Company.findOne({ companyId: user.companyId, status: "active" });

  if (!company) {
    throw new AppError("Company is not active", 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return createSession(user, company);
}

async function refresh(rawToken) {
  if (!rawToken) throw new AppError("Refresh token is required", 401, undefined, "REFRESH_REQUIRED");
  const tokenHash = hashToken(rawToken);
  const record = await RefreshToken.findOne({ tokenHash });
  if (!record) throw new AppError("Invalid refresh token", 401, undefined, "INVALID_REFRESH_TOKEN");
  if (record.revokedAt) {
    await RefreshToken.updateMany({ familyId: record.familyId, revokedAt: null }, { revokedAt: new Date() });
    throw new AppError("Refresh token reuse detected", 401, undefined, "REFRESH_TOKEN_REUSED");
  }
  if (record.expiresAt <= new Date()) throw new AppError("Refresh token expired", 401, undefined, "REFRESH_TOKEN_EXPIRED");
  const user = await User.findById(record.userId);
  const company = user && await Company.findOne({ companyId: user.companyId, status: "active" });
  if (!user?.isActive || !company) throw new AppError("Session is no longer active", 401, undefined, "SESSION_INACTIVE");
  const next = await issueRefreshToken(user, record.familyId);
  record.revokedAt = new Date(); record.replacedByHash = next.tokenHash; await record.save();
  return { token: signAccessToken(user), refreshToken: next.token, user: user.toSafeObject(), company: toCompanyProfile(company) };
}

async function logout(rawToken) {
  if (rawToken) await RefreshToken.updateOne({ tokenHash: hashToken(rawToken), revokedAt: null }, { revokedAt: new Date() });
}

async function getCurrentUser(user) {
  const company = await Company.findOne({ companyId: user.companyId });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return {
    user: user.toSafeObject(),
    company: toCompanyProfile(company),
  };
}

module.exports = {
  registerCompany,
  login,
  getCurrentUser,
  refresh,
  logout,
};
