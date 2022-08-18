const jwt = require('./jwt');

const getAuthenticationToken = (req) => {
    if (!req.headers.authorization) {
        return null;
    }

    // Remove url from api in token
    const token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decodedToken(token);

        return payload;
    } catch (ex) {
        return null;
    }
};

module.exports = {
    getAuthenticationToken,
};
