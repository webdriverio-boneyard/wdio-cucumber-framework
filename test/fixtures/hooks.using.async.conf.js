import path from 'path'

global._____wdio = {
    onPrepare: {},
    before: {},
    beforeFeature: {},
    beforeScenario: {},
    beforeStep: {},
    beforeCommand: {},
    afterCommand: {},
    afterStep: {},
    afterScenario: {},
    afterFeature: {},
    after: {},
    onComplete: {}
}

export default {
    capabilities: {
        browserName: 'chrome'
    },

    cucumberOpts: {
        timeout: 5000,
        require: [path.join(__dirname, '/async-step-definitions.js')]
    },

    before: (...args) => {
        global._____wdio.before.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.before.end = new Date().getTime()
        })
    },
    beforeFeature: (...args) => {
        global._____wdio.beforeFeature.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeFeature.end = new Date().getTime()
        })
    },
    beforeScenario: (...args) => {
        global._____wdio.beforeScenario.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeScenario.end = new Date().getTime()
        })
    },
    beforeStep: (...args) => {
        global._____wdio.beforeStep.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeStep.end = new Date().getTime()
        })
    },
    beforeCommand: (...args) => {
        global._____wdio.beforeCommand.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.beforeCommand.end = new Date().getTime()
        })
    },
    afterCommand: (...args) => {
        global._____wdio.afterCommand.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterCommand.end = new Date().getTime()
        })
    },
    afterStep: (...args) => {
        global._____wdio.afterStep.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterStep.end = new Date().getTime()
        })
    },
    afterScenario: (...args) => {
        global._____wdio.afterScenario.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterScenario.end = new Date().getTime()
        })
    },
    afterFeature: (...args) => {
        global._____wdio.afterFeature.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.afterFeature.end = new Date().getTime()
        })
    },
    after: (...args) => {
        global._____wdio.after.start = new Date().getTime()
        return browser.pause(500).then(() => {
            global._____wdio.after.end = new Date().getTime()
        })
    }
}
