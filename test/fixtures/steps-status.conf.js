export default {
    sync: false,
    capabilities: {
        browserName: 'chrome'
    },

    cucumberOpts: {
        timeout: 5000,
        require: [__dirname + '/steps-status-step-definitions.js']
    }
}
