const { newUser, getAllDepartment, getAllUser, getAllLevel, getAllCompany } = require("../../controllers/integration/hcm.recruitment.service.controller");

const { body } = require('express-validator');

const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (app) {

  app.post(
    "/api/integration/hcm-recruitment/new-user",
    [body('nik').isLength({ min: 5 }).withMessage('must be at least 5 chars long'),
    body('fullname').isLength({ min: 3 }).withMessage('must be at least 3 chars long'),
    body('position').notEmpty().withMessage('position required'),
    body('employee_status').notEmpty().withMessage('employee_status required'),
    body('department').notEmpty().withMessage('department required').custom(value => {
      if (!ObjectId.isValid(value)) {
        throw new Error('BSONTypeError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer');
      }
      return value
    }),
    body('direct_spv').notEmpty().withMessage('direct spv required').custom(value => {
      if (!ObjectId.isValid(value)) {
        throw new Error('BSONTypeError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer');
      }
      return value
    }),
    body('level').notEmpty().withMessage('level required').custom(value => {
      if (!ObjectId.isValid(value)) {
        throw new Error('BSONTypeError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer');
      }
      return value
    }),
    body('company').notEmpty().withMessage('company required').custom(value => {
      if (!ObjectId.isValid(value)) {
        throw new Error('BSONTypeError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer');
      }
      return value
    }),
    body('created_by').notEmpty().withMessage('created_by required')
    ],
    newUser
  );

  app.get(
    "/api/integration/hcm-recruitment/departments",
    [
      getAllDepartment
    ],
  );

  app.get(
    "/api/integration/hcm-recruitment/supervisor",
    [
      getAllUser
    ],
  );

  app.get(
    "/api/integration/hcm-recruitment/level",
    [
      getAllLevel
    ],
  );

  app.get(
    "/api/integration/hcm-recruitment/company",
    [
      getAllCompany
    ],
  );
};

