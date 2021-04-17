const app = require('./app');
const { IP_SERVER } = require('./config');
const port = process.env.PORT || 3977;

app.listen(port, () => {
    console.log('-----------------------');
    console.log('------ API REST -------');
    console.log('-----------------------');

    console.log(`http://${IP_SERVER}:${port}/api/`);
});

// const easymidi = require('easymidi');
// const output = new easymidi.Output('Mindy', true);

// const sendNote = (noteValue, duration) => {
//     output.send('noteon', noteValue);

//     setTimeout(() => {
//         output.send('noteoff', noteValue);
//     }, duration);
// }

// setInterval(() => {
//     const noteValue = {
//         note: 12 * 4,
//         velocity: 127,
//         channel: 1
//     }
//     sendNote(noteValue, 500);
// }, 1000);
