import path from 'path'

global.__wdio = {
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
        require: [path.join(__dirname, '/step-definitions.js')]
    },

    before: (...args) => {
        global.__wdio.before.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.before.end = new Date().getTime()
    },
    beforeFeature: (...args) => {
        global.__wdio.beforeFeature.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeFeature.end = new Date().getTime()
    },
    beforeScenario: (...args) => {
        global.__wdio.beforeScenario.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeScenario.end = new Date().getTime()
    },
    beforeStep: (...args) => {
        global.__wdio.beforeStep.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeStep.end = new Date().getTime()
    },
    beforeCommand: (...args) => {
        global.__wdio.beforeCommand.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.beforeCommand.end = new Date().getTime()
    },
    afterCommand: (...args) => {
        global.__wdio.afterCommand.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterCommand.end = new Date().getTime()
    },
    afterStep: (...args) => {
        global.__wdio.afterStep.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterStep.end = new Date().getTime()
    },
    afterScenario: (...args) => {
        global.__wdio.afterScenario.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterScenario.end = new Date().getTime()
    },
    afterFeature: (...args) => {
        global.__wdio.afterFeature.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.afterFeature.end = new Date().getTime()
    },
    after: (...args) => {
        global.__wdio.after.start = new Date().getTime()
        browser.pause(500)
        global.__wdio.after.end = new Date().getTime()
    }
}
