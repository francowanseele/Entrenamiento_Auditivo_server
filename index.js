const app = require('./app');
const { host, port } = require('./config');

app.listen(port, () => {
    console.log('-----------------------');
    console.log('------ API REST -------');
    console.log('-----------------------');

    console.log(`http://${host}:${port}/api/`);
});
