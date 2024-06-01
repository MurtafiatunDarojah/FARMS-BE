require('dotenv').config()


module.exports = {
    whatsapp: {
        // Send Link To redirect
        link: process.env.WA_LINK_REDIRECT,
        // pc api wa, yg digunakan adalah authentication whatsapp
        pc_chat : process.env.PC_CHAT_API,
        api_key: process.env.API_KEY
    },
};