const yahooFinance = require('yahoo-finance2').default;

exports.Quotes = async (req, res) => {
  try {
    const results = await yahooFinance.quoteSummary('BRMS.JK');

    return res.send({ code: 200, status: "OK", data: results })

  } catch (error) {

    console.log(error)
    return res.status(500).send(error.toString())
  }
};