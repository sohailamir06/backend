const Joi = require("joi");

const namePattern = /^[a-zA-Z][a-zA-Z\s'.-]*$/;
const phonePattern = /^[+0-9()\-\s]{7,30}$/;

const registerCompanySchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(120).required(),
  industry: Joi.string().trim().min(2).max(80).required(),
  country: Joi.string().trim().min(2).max(80).required(),
  firstName: Joi.string().trim().min(2).max(60).pattern(namePattern).required(),
  lastName: Joi.string().trim().min(2).max(60).pattern(namePattern).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  phoneNumber: Joi.string().trim().pattern(phonePattern).required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[a-z]/, "lowercase letter")
    .pattern(/[A-Z]/, "uppercase letter")
    .pattern(/[0-9]/, "number")
    .pattern(/[^a-zA-Z0-9]/, "special character")
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "confirmPassword must match password",
  }),
  termsAccepted: Joi.boolean().valid(true).required().messages({
    "any.only": "termsAccepted must be true",
  }),
  newsletterSubscribed: Joi.boolean().default(false),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(1).max(128).required(),
});

module.exports = {
  registerCompanySchema,
  loginSchema,
};
