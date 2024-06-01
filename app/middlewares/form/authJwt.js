
const { default: axios } = require("axios");
const config = require("../../config/auth.config.js");

const db = require("../../models");
let log = require('../../config/winston')

const User = db.user;
const Role = db.role;

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }

    // Check Token To MS GRAPH API
    let response = await axios.get(config.MSGraph, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 200)

      // send parameter from token oauth2, later no need from parameter client 
      if (!req.body.email) {
        req.body.email = response.data.mail || response.data.userPrincipalName
      }

    next();

  } catch (error) {
    log.error({
      date: new Date(),
      error: error.toString()
    })
    if (error.response)
      res.status(error.response.status).send(error.response.data);
    else res.status(500).send({ error: String(error) })
  }
};

const isUser = (req, res, next) => {

  let data = req.body.email ? req.body.email : req.query.email;

  User.findOne({
    email: data,
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
      Role.find(
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
            // allow user & admin
            if (role.name === "user" || role.name === "admin") {
              next();
              return;
            }
          }

          return res.status(403).send({ message: "Require User Role!" });
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
  verifyToken,
  isUser,
};

module.exports = authJwt;
