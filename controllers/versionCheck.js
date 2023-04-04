async function needUpdate(req, res) {
    try {
        res.status(200).send({
            ok: true,
            isNeeded: true,
            message: 'Version Obtenida.',
        });
    } catch (error) {
        logError('versionCheck/needUpdate', error, req);
        res.status(501).send({
            ok: false,
            message: error.message,
        });
    }
}

module.exports = {
    needUpdate,
};
