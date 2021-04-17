const easymidi = require('easymidi');
const output = new easymidi.Output('Mindy', true);

function playSound_easymidi(req, res) {
    console.log('play sound ....');

    const sendNote = (noteValue, duration) => {
        output.send('noteon', noteValue);

        setTimeout(() => {
            output.send('noteoff', noteValue);
        }, duration);
    }

    setInterval(() => {
        const noteValue = {
            note: 12 * 4,
            velocity: 127,
            channel: 1
        }
        sendNote(noteValue, 500);
    }, 1000);

    res.status(200).send({ message: 'play sound' });
}

function playSound(req, res) {
    console.log('play sound.......');

    

    res.status(200).send({ message: 'play sound' });
}

module.exports = {
    playSound,
};
