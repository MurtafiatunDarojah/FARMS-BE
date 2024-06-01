const db = require("../../models");
const log = require('../../config/winston');

const Department = db.department;
const Level = db.level_user;
const Company = db.company;
const User = db.user;

const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');

exports.newUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const user_id = await User.findOne({ email: req.body.email });
    const user = await new User({
      nik: req.body.nik,
      fullname: req.body.fullname,
      username: req.body.username,
      position: req.body.position,
      employee_status: req.body.employee_status,
      email: req.body.email,
      exp_date: req.body.exp_date,
      department: db.mongoose.Types.ObjectId(req.body.department),
      password: bcrypt.hashSync('BRMS@2022', 8),
      direct_spv: db.mongoose.Types.ObjectId(req.body.direct_spv),
      roles: db.mongoose.Types.ObjectId(req.body.roles || '62b97ff0a39330b31b03edf0'),
      level: db.mongoose.Types.ObjectId(req.body.level),
      company: db.mongoose.Types.ObjectId(req.body.company),
      exp_date: req.body.exp_date,
      updated_by: user_id._id,
      created_by: user_id._id,
    });

    // Insert User
    await user.save();

    res.send({ message: "User was registered successfully!" });
  } catch (error) {
    log.error({
      date: new Date(),
      error: error.toString()
    });
    res.status(500).send({ message: error.toString() });
  }
};

async function getCollectionData(collectionName, projection) {
    try {
      const data = await collectionName.find({}, projection);
      return { code: 200, status: "OK", data };
    } catch (error) {
      log.error({
        date: new Date(),
        error: error.toString()
      });
      throw new Error(error.toString());
    }
  }
  
  exports.getAllDepartment = async (req, res) => {
    const projection = { _id: 1, fullname: 1 };
    const data = await getCollectionData(Department, projection);
    return res.send(data);
  };
  
  exports.getAllUser = async (req, res) => {
    const projection = { _id: 1, fullname: 1 };
    const data = await getCollectionData(User, projection);
    return res.send(data);
  };

  exports.getAllLevel = async (req, res) => {
    const projection = { _id: 1, fullname: 1 };
    const data = await getCollectionData(Level, projection);
    return res.send(data);
  };

  exports.getAllCompany = async (req, res) => {
    const projection = { _id: 1, fullname: 1 };
    const data = await getCollectionData(Company, projection);
    return res.send(data);
  };

  
