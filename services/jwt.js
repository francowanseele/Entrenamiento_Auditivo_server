const jwt = require('jwt-simple');
const moment = require('moment');
const { jwtKey } = require('../config');

exports.createAccessToken = function (user) {
    const payload = {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        isTeacher: user.isTeacher,
        personalCourseId: user.personalCourseId,
        createToken: moment().unix(),
        exp: moment().add(3, 'hours').unix(),
    };

    return jwt.encode(payload, jwtKey);
};

exports.createRefreshToken = function (user) {
    const payload = {
        id: user.id,
        exp: moment().add(360, 'days').unix(),
    };

    return jwt.encode(payload, jwtKey);
};

exports.decodedToken = function (token) {
    return jwt.decode(token, jwtKey, true);
};
