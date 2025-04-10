const Joi = require('joi');

const schemas = {
  user: Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('User', 'Admin', 'RA').default('User'),
    notifications: Joi.boolean().default(true)
  }),

  contract: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    status: Joi.string().valid('Active', 'Expired', 'Pending', 'Terminated').default('Active'),
    fileUrl: Joi.string().optional(),
    userId: Joi.number().required(),
    companyId: Joi.number().optional(),
    departmentId: Joi.number().optional()
  }),

  // Add other schemas here...
};

module.exports = schemas;