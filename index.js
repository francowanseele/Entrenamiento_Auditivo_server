const mongoose = require('mongoose');
const app = require('./app');
const {
    IP_SERVER,
    PORT_DB,
    NAME_DATABASE,
    CONECTION_STRING,
    CONECTION_STRING_LOCAL_FRANCO,
} = require('./config');
const port = process.env.PORT || 3977;

mongoose.set('useFindAndModify', false);

mongoose.connect(
    CONECTION_STRING,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, res) => {
        if (err) {
            throw err;
        } else {
            app.listen(port, () => {
                console.log('-----------------------');
                console.log('------ API REST -------');
                console.log('-----------------------');

                console.log(`http://${IP_SERVER}:${port}/api/`);
            });
        }
    }
);
