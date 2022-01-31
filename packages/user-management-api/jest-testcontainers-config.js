module.exports = {
    cognito: {
        image: 'jagregory/cognito-local',
        tag: 'latest',
        ports: [9229],
        env: {
            EXAMPLE: 'env',
        },
        wait: {
            type: 'text',
            text: 'NONE NONE Cognito Local running on http://0.0.0.0:9229'
        }
    },
};
