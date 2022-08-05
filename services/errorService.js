const logError = (method, error, request) => {
    const datetime = new Date();
    console.log('--------------------------');
    console.log('METHOD: ' + method);
    console.log('DATE: ');
    console.log(datetime);
    if (request) {
        console.log('--------------------------');
        console.log('BODY: ');
        console.log(request.body);
        console.log('QUERY: ');
        console.log(request.query);
        console.log('PARAMS: ');
        console.log(request.params);
    }
    console.log('--------------------------');
    console.log('ERROR: ');
    console.log(error);
};

module.exports = {
    logError,
};
