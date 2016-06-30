import { executeHooksWithArgs } from 'wdio-sync'

const CUCUMBER_EVENTS = [
    'handleBeforeFeatureEvent', 'handleAfterFeatureEvent',
    'handleBeforeScenarioEvent', 'handleAfterScenarioEvent',
    'handleBeforeStepEvent', 'handleStepResultEvent'
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

    handleBeforeFeatureEvent (event) {
        const feature = event.getUri ? event : event.getPayloadItem('feature')
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

        return exec.catch((e) => {
            console.error(`beforeFeature has thrown an error: ${e}`)
        })
    }

    handleBeforeScenarioEvent (event) {
        const scenario = event.getUri ? event : event.getPayloadItem('scenario')
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

        return exec.catch((e) => {
            console.error(`beforeScenario has thrown an error: ${e}`)
        })
    }

    handleBeforeStepEvent (event) {
        const step = event.getUri ? event : event.getPayloadItem('step')
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

        return exec.catch((e) => {
            console.error(`beforeStep has thrown an error: ${e}`)
        })
    }

    handleStepResultEvent (event) {
        const stepResult = event.getStep ? event : event.getPayloadItem('stepResult')
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

        return exec.catch((e) => {
            console.error(`afterStep has thrown an error: ${e}`)
        })
    }

    handleAfterScenarioEvent (event) {
        const scenario = event.getUri ? event : event.getPayloadItem('scenario')
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

        return exec.catch((e) => {
            console.error(`afterScenario has thrown an error: ${e}`)
        })
    }

    handleAfterFeatureEvent (event) {
        const feature = event.getUri ? event : event.getPayloadItem('feature')
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

        return exec.catch((e) => {
            console.error(`afterFeature has thrown an error: ${e}`)
        })
    }
}

export default HookRunner
