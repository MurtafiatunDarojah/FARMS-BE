
const { default: axios } = require("axios");
const config = require("../../config/auth.config.js");
const { user, role } = require("../../models/index.js");
let log = require('../../config/winston');


verifyToken = async (req, res, next) => {
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

isAdmin = (req, res, next) => {
    user.findOne({
        uid: req.body.user_updated,
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
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].name === "admin") {
                            next();
                            return;
                        }
                    }
                    res.status(403).send({ message: "Require Admin Role!" });
                    return;
                }
            );
        } else {
            res.status(400).send({
                message: `Failed! Admin ${req.body.user_updated} does not exist!`,
            });
        }
    });
};

isUser = (req, res, next) => {

    data = req.body.email ? req.body.email : req.query.email;

    user.findOne({
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
            role.find(
                {
                    _id: { $in: user.roles },
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    for (let i = 0; i < roles.length; i++) {
                        // allow user & admin
                        if (roles[i].name === "user" || roles[i].name === "admin") {
                            next();
                            return;
                        }
                    }

                    res.status(403).send({ message: "Require User Role!" });
                    return;
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
    isAdmin,
    isUser,
};

module.exports = authJwt;
