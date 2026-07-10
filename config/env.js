const dotenv = require("dotenv");
const Joi = require("joi");

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(5000),
  MONGODB_URI: Joi.string().trim().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().trim().default("7d"),
  CLIENT_ORIGIN: Joi.string().trim().default("http://localhost:5173"),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(60000).default(900000),
  RATE_LIMIT_MAX: Joi.number().integer().min(10).default(100),
}).unknown(true);

const { value: env, error } = envSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Environment validation failed: ${error.details.map((detail) => detail.message).join(", ")}`);
}

module.exports = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  clientOrigins: env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: env.RATE_LIMIT_MAX,
};
