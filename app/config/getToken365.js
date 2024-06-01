const msal = require('@azure/msal-node');

const getTokenWithUsernamePassword = async (clientId, tenantId, clientSecret, username, password) => {
    const config = {
        auth: {
            clientId: clientId,
            authority: `https://login.microsoftonline.com/${tenantId}`,
            clientSecret: clientSecret
        }
    };

    const cca = new msal.ConfidentialClientApplication(config);

    const userCredential = {
        username: username,
        password: password
    };

    const userRequest = {
        scopes: ["openid", "profile", "email"]
    };

    try {
        const response = await cca.acquireTokenByUsernamePassword(userCredential, userRequest);
        return response.accessToken;
    } catch (error) {
        console.log(error);
        return null;
    }
};


module.exports = getTokenWithUsernamePassword;
