const app = require('./app');
const { IP_SERVER } = require('./config');
const port = process.env.PORT || 3977;

app.listen(port, () => {
    console.log('-----------------------');
    console.log('------ API REST -------');
    console.log('-----------------------');

    console.log(`http://${IP_SERVER}:${port}/api/`);
});

// if (process.env.NODE_ENV === 'development') {
//     const { cache } = require;
//     const persistentFiles: String[] = [];
//     const clearCache = (except: String[]) => {
//         for (let key in cache)
//             if (!except.includes(key) && key.indexOf('/node_modules/') === -1)
//                 delete cache[key];
//     };
//     app.use((req, res, next) => {
//         clearCache(persistentFiles);
//         const { router } = require('config/routes');
//         router.handle(req, res, next);
//     });
// } else {
//     const router = require('config/routes');
//     app.use(router.handle);
// }

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
