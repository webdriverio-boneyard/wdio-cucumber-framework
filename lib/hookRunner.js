import { executeHooksWithArgs } from 'wdio-sync'
const CUCUMBER_EVENTS = [
    'handleBeforeFeature', 'handleAfterFeature',
    'handleBeforeScenario', 'handleAfterScenario',
    'handleBeforeStep', 'handleStepResult'
]

class HookRunner {
    constructor (BaseListener, config) {
        this.listener = BaseListener

        this.beforeFeature = config.beforeFeature
        this.beforeScenario = config.beforeScenario
        this.beforeStep = config.beforeStep
        this.afterFeature = config.afterFeature
        this.afterScenario = config.afterScenario
        this.afterStep = config.afterStep

        for (const fnName of CUCUMBER_EVENTS) {
            this.listener[fnName] = HookRunner.prototype[fnName].bind(this)
        }
    }

    getListener () {
        return this.listener
    }

    handleBeforeFeature (event) {
        const feature = event
        const exec = executeHooksWithArgs(this.beforeFeature, [feature])
        const done = arguments[1]
        if (done.length === 0) {
            exec.then((res) => {
                if (typeof done === 'function') {
                    done(res)
                }
                return res
            })
        }

        return exec.then(() => done())
    }

    handleBeforeScenario (event) {
        const scenario = event
        const done = arguments[1]
        const exec = executeHooksWithArgs(this.beforeScenario, [scenario])
        if (done.length === 0) {
            exec.then((res) => {
                if (typeof done === 'function') {
                    done(res)
                }
                return res
            })
        }

        return exec.catch(() => done())
    }

    handleBeforeStep (event) {
        const step = event
        const done = arguments[1]
        const exec = executeHooksWithArgs(this.beforeStep, [step])
        if (done.length === 0) {
            exec.then((res) => {
                if (typeof done === 'function') {
                    done(res)
                }
                return res
            })
        }

        return exec.catch(() => done())
    }

    handleStepResult (event) {
        const stepResult = event
        const done = arguments[1]
        const exec = executeHooksWithArgs(this.afterStep, [stepResult])
        if (done.length === 0) {
            exec.then((res) => {
                if (typeof done === 'function') {
                    done(res)
                }
                return res
            })
        }

        return exec.catch(() => done())
    }

    handleAfterScenario (event) {
        const scenario = event
        const done = arguments[1]
        const exec = executeHooksWithArgs(this.afterScenario, [scenario])
        if (done.length === 0) {
            exec.then((res) => {
                if (typeof done === 'function') {
                    done(res)
                }
                return res
            })
        }

        return exec.catch(() => done())
    }

    handleAfterFeature (event) {
        const feature = event
        const done = arguments[1]
        const exec = executeHooksWithArgs(this.afterFeature, [feature])
        if (done.length === 0) {
            exec.then((res) => {
                if (typeof done === 'function') {
                    done(res)
                }
                return res
            })
        }

        return exec.catch(() => done())
    }
}

export default HookRunner
