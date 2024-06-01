require('dotenv').config()

let SQSUrlWA = process.env.SQS_URL_WA;
let SQSUrlEMAIL = process.env.SQS_URL_EMAIL;

module.exports = {
  SQSUrlWA,
  SQSUrlEMAIL,
};