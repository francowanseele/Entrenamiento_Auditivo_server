const mongoose = require('mongoose');
const app = require('./app');
const { CONECTION_STRING, host, port, sql } = require('./config');

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

                console.log(`http://${host}:${port}/api/`);
            });
        }
    }
);