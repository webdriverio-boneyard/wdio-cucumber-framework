import path from 'path'

const NOOP = () => {}

global.____wdio = {
    customWdio: {},
    customWdioPromise: {},
    customNativePromise: {},
    customQPromise: {},
    customWrapWdio: {},
    customWrapWdioPromise: {},
    customWrapTwoPromises: {},
    customHandleWdioAsPromise: {}
}

export default {
    capabilities: {
        browserName: 'chrome'
    },

    cucumberOpts: {
        timeout: 5000,
        require: [path.join(__dirname, '/custom-commands.js')]
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
