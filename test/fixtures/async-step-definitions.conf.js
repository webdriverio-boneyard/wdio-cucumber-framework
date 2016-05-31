const NOOP = () => {}

export default {
    sync: false,
    capabilities: {
        browserName: 'chrome'
    },

    cucumberOpts: {
        timeout: 5000,
        require: [__dirname + '/async-step-definitions.js']
    },

    onPrepare: NOOP,
    before: NOOP,
    beforeSuite: NOOP,
    beforeHook: NOOP,
    afterHook: NOOP,
    beforeTest: NOOP,
    beforeCommand: NOOP,
    afterCommand: NOOP,
    afterTest: NOOP,
    afterSuite: NOOP,
    after: NOOP,
    onComplete: NOOP
}
