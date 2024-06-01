require('dotenv').config()

module.exports = {
    secret: process.env.SECRET_JWT_TOKEN,
    apikey: [process.env.API_KEY],
    MSGraph : process.env.MSGRAPH_ENDPOINT
};