const app = require('./app');
const { CONECTION_STRING, host, port, sql } = require('./config');

app.listen(port, () => {
    console.log('-----------------------');
    console.log('------ API REST -------');
    console.log('-----------------------');

    console.log(`http://${host}:${port}/api/`);
});
