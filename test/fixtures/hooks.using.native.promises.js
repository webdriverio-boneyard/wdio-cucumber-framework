import path from 'path'

global._wdio = {}

export default {
    capabilities: {
        browserName: 'chrome'
    },

    cucumberOpts: {
        timeout: 5000,
        require: [path.join(__dirname, '/step-definitions.js')]
    },

    before: (...args) => {
        global._wdio.before = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.before.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeFeature: (...args) => {
        global._wdio.beforeFeature = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeFeature.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeScenario: (...args) => {
        global._wdio.beforeScenario = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeScenario.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeStep: (...args) => {
        global._wdio.beforeStep = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeStep.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    beforeCommand: (...args) => {
        global._wdio.beforeCommand = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.beforeCommand.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterCommand: (...args) => {
        global._wdio.afterCommand = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterCommand.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterStep: (...args) => {
        global._wdio.afterStep = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterStep.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterScenario: (...args) => {
        global._wdio.afterScenario = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterScenario.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    afterFeature: (...args) => {
        global._wdio.afterFeature = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.afterFeature.end = new Date().getTime()
                resolve()
            }, 500)
        })
    },
    after: (...args) => {
        global._wdio.after = {
            wasExecuted: true,
            start: new Date().getTime(),
            args
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                global._wdio.after.end = new Date().getTime()
                resolve()
            }, 500)
        })
    }
}
