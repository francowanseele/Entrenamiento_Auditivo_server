const app = require('./app');
const { IP_SERVER } = require('./config');
const port = process.env.PORT || 3977;

app.listen(port, () => {
    console.log('-----------------------');
    console.log('------ API REST -------');
    console.log('-----------------------');

    console.log(`http://${IP_SERVER}:${port}/api/`);
});
