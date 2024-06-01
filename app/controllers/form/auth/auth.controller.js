const axios = require('axios').default;
const https = require('https');

const db = require("../../../models");
const { MSGraph } = require("../../../config/auth.config");
const whatsapp_req = require('../../../config/services.js');

let log = require('../../../config/winston');
const User = db.user;

exports.tokenCheck365 = async (req, res) => {
  try {
    let resMSGraph = await axios.get(MSGraph, {
      headers: {
        'Authorization': `Bearer ${req.body.access_token}`
      }
    })

    let user = await User.findOne({ email: resMSGraph.data.mail || resMSGraph.data.userPrincipalName })
      .populate("roles", "-__v")
      .populate("company", "fullname code phone_number")
      .populate("department")
      .populate("level")
      .populate('direct_spv')

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    let authorities = [];
    
      for (const element of user.roles) {
        authorities.push("ROLE_" + element.name.toUpperCase());
      }

    return res.status(200).send({
      id: user._id,
      nik: user.nik,
      uid: user.uid,
      fullname: user.fullname,
      department: user.department,
      email: user.email,
      phone_number: user.phone_number,
      roles: authorities,
      company: user.company,
      direct_supervisor: user.direct_spv,
      level: user.level,
      phone_number_activation: user.number_phone_activation
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }

    log.error({
      date: new Date(),
      error: error.toString()
    })

    return res.status(500).send({ error: error.toString() })
  }
};

exports.completeEmailUser = async (req, res) => {
  try {

    let user = await User.findByIdAndUpdate(req.body.id, { email: req.body.email })

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    return res.send({ code: 200, status: "OK" })

  } catch (error) {
    log.error({
      date: new Date(),
      error: error.toString()
    })

    return res.status(500).send({ error: error.toString() })
  }
}

exports.phoneNumberVerification = async (req, res) => {
  try {

    // Send WA Notification
    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    let messageTemplate = "Terima Kasih anda telah melakukan verifikasi nomor whatsapp anda untuk keperluan notifikasi"

    let responsewa = await instance.post(whatsapp_req.whatsapp.pc_chat, {
      number: req.body.number,
      message: messageTemplate
    }, { headers: { 'x-api-key': whatsapp_req.whatsapp.api_key } })

    if (responsewa.status === 200) {

      await User.findOneAndUpdate({ email: req.body.email }, { phone_number: req.body.number, number_phone_activation: true }, { upsert: true })

      res.send('Verifikasi number success')
    } else {
      res.status(responsewa.status).send(responsewa.data)
    }

  } catch (error) {

    console.log(error)
    return res.status(500).send('Nomor yang dimasukan tidak valid')
  }
};