const { user, role, department, company, access_permission } = require("../../models/index.js");
const config = require("../../config/auth.config.js");
let log = require('../../config/winston');

const { default: axios } = require("axios");

const verifyTokenAdmin = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }

    // Check Token Against MS GRAPH API
    const response = await axios.get(config.MSGraph, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      // Retrieve user details from your database using the email from MS Graph response
      const getUser = await user.findOne({ email: response.data.mail });
  
      // Set request body parameters
      req.email = response.data.mail || response.data.userPrincipalName;
      req.nik = getUser.nik;
      req.userId = getUser.id;
      req.fullname = getUser.fullname;

      next();
    }
  } catch (error) {
    log.error({
      date: new Date(),
      error: error.toString()
    });

    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send({ error: String(error) });
    }
  }
};

const checkAccessPermission = async (req, res, next, menu_code, permission_give) => {

  let getAccessPermission = await access_permission.find({ user_nik: req.nik, menu: menu_code });

  if (getAccessPermission.length === 0) {
    return res.status(401).send({ message: "There are no access permissions." });
  }

  if (getAccessPermission[0].permission === 'Write' || getAccessPermission[0].permission === permission_give[0]) {
    return next();
  }

  return res.status(403).send({ message: "Unauthorized! need permission " + permission_give + '. please contact administrator' });
};

const isAdmin = (req, res, next) => {
  user.findOne({
    _id: req.userId,
  }).exec((err, user) => {
    if (err) {

      log.error({
        date: new Date(),
        error: err.toString()
      })

      res.status(500).send({ message: err });
      return;
    }
    if (user) {
      role.find(
        {
          _id: { $in: user.roles },
        },
        (err, roles) => {
          if (err) {

            log.error({
              date: new Date(),
              error: err.toString()
            })

            res.status(500).send({ message: err });
            return;
          }

          for (const role of roles) {
            if (role.name === "admin") {
              next();
              return;
            }
          }

          return res.status(403).send({ message: "Require Admin Role!" });
        }
      );
    } else {
      res.status(400).send({
        message: `Failed! Admin ${req.body.user_updated} does not exist!`,
      });
    }
  });
};

const isHRGA = (req, res, next) => {
  user.findById(req.userId).exec((err, user) => {

    if (err) {

      log.error({
        date: new Date(),
        error: err.toString()
      })

      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      department.findById(
        {
          _id: user.department,
        },
        (err, department_data) => {
          if (err) {

            log.error({
              date: new Date(),
              error: err.toString()
            })

            return res.status(500).send({ message: err });
          }

          if (department_data.code === "HRGA") {
            return next();
          }

          return res.status(403).send({ message: "Require HRGA department!" });
        }
      );
    } else {
      res.status(400).send({
        message: `Failed! User ${data} does not exist!`,
      });
    }
  });
}

const isIT = (req, res, next) => {

  user.findById(req.userId).exec((err, user) => {

    if (err) {

      log.error({
        date: new Date(),
        error: err.toString()
      })

      res.status(500).send({ message: err });
      return;
    }

    if (user) {

      // DECLARE NAME
      req.fullname = user.fullname

      department.findById(
        {
          _id: user.department,
        },
        (err, department_data) => {
          if (err) {

            log.error({
              date: new Date(),
              error: err.toString()
            })

            res.status(500).send({ message: err });
            return;
          }

          if (department_data.code === "IT") {
            next();
            return;
          }

          return res.status(403).send({ message: "Require IT department!" });
        }
      );
    } else {
      res.status(400).send({
        message: `Failed! User ${data} does not exist!`,
      });
    }
  });
}

const isCompanyBRM = (req, res, next) => {

  user.findById(req.userId).exec((err, user) => {

    if (err) {

      log.error({
        date: new Date(),
        error: err.toString()
      })

      res.status(500).send({ message: err });
      return;
    }
    if (user) {
      company.findById(
        {
          _id: user.company,
        },
        (err, company_data) => {

          if (err) {

            log.error({
              date: new Date(),
              error: err.toString()
            })

            res.status(500).send({ message: err });
            return;
          }

          if (company_data._id != '62b97ff0a39330b31b03ede8') { //BRM
            req.query.company_id = company_data._id
          }

          return next();
        }
      );
    } else {
      res.status(400).send({
        message: `Failed! User ${data} does not exist!`,
      });
    }
  });

}

const isUser = async (req, res, next) => {
  try {
    const data = req.body.email || req.query.email;

    const userRecord = await user.findOne({ email: data }).exec();

    if (!userRecord) {
      return res.status(400).send({ message: `Failed! User ${data} does not exist!` });
    }

    const roles = await Role.find({ _id: { $in: userRecord.roles } }).exec();

    let hasValidRole = false;
    for (const role of roles) {
      if (role.name === "user" || role.name === "admin") {
        hasValidRole = true;
        break;
      }
    }

    if (hasValidRole) {
      next();
    } else {
      return res.status(403).send({ message: "Require User Role!" });
    }
  } catch (err) {
    log.error({
      date: new Date(),
      error: err.toString()
    });
    res.status(500).send({ message: err });
  }
};

const IsAdministrationSupport = (req, res, next) => {

  user.findById(req.userId).exec((err, user) => {

    if (err) {

      log.error({
        date: new Date(),
        error: err.toString()
      })

      res.status(500).send({ message: err });
      return;
    }

    if (user) {

      // DECLARE NAME
      req.fullname = user.fullname

      department.findById(
        {
          _id: user.department,
        },
        (err, department_data) => {
          if (err) {

            log.error({
              date: new Date(),
              error: err.toString()
            })

            res.status(500).send({ message: err });
            return;
          }

          if (department_data.code === "Admin & Support") {
            next();
            return;
          }

          return res.status(403).send({ message: "Require Admin & Support!" });

        }
      );
    } else {
      res.status(400).send({
        message: `Failed! User ${data} does not exist!`,
      });
    }
  });
};


const authJwt = {
  verifyTokenAdmin,
  isAdmin,
  isUser,
  isHRGA,
  isIT,
  isCompanyBRM,
  IsAdministrationSupport,
  checkAccessPermission
};

module.exports = authJwt;
