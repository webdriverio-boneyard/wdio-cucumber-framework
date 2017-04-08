import path from 'path'
import q from 'q'

global.___wdio = {
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
        global.___wdio.before.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.before.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeFeature: (...args) => {
        global.___wdio.beforeFeature.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeFeature.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeScenario: (...args) => {
        global.___wdio.beforeScenario.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeScenario.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeStep: (...args) => {
        global.___wdio.beforeStep.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeStep.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    beforeCommand: (...args) => {
        global.___wdio.beforeCommand.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.beforeCommand.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterCommand: (...args) => {
        global.___wdio.afterCommand.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterCommand.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterStep: (...args) => {
        global.___wdio.afterStep.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterStep.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterScenario: (...args) => {
        global.___wdio.afterScenario.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterScenario.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    afterFeature: (...args) => {
        global.___wdio.afterFeature.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.afterFeature.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    },
    after: (...args) => {
        global.___wdio.after.start = new Date().getTime()
        const defer = q.defer()
        setTimeout(() => {
            global.___wdio.after.end = new Date().getTime()
            defer.resolve()
        }, 500)
        return defer.promise
    }
}
