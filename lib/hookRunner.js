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

    handleBeforeFeatureEvent (e, done) {
        return executeHooksWithArgs(this.beforeFeature, [e.getPayloadItem('feature')]).then(done, (e) => {
            console.error(`beforeFeature has thrown an error: ${e}`)
        })
    }

    handleBeforeScenarioEvent (e, done) {
        return executeHooksWithArgs(this.beforeScenario, [e.getPayloadItem('scenario')]).then(done, (e) => {
            console.error(`beforeScenario has thrown an error: ${e}`)
        })
    }

    handleBeforeStepEvent (e, done) {
        return executeHooksWithArgs(this.beforeStep, [e.getPayloadItem('step')]).then(done, (e) => {
            console.error(`beforeStep has thrown an error: ${e}`)
        })
    }

    handleStepResultEvent (e, done) {
        return executeHooksWithArgs(this.afterStep, [e.getPayloadItem('stepResult')]).then(done, (e) => {
            console.error(`afterStep has thrown an error: ${e}`)
        })
    }

    handleAfterScenarioEvent (e, done) {
        return executeHooksWithArgs(this.afterScenario, [e.getPayloadItem('scenario')]).then(done, (e) => {
            console.error(`afterScenario has thrown an error: ${e}`)
        })
    }

    handleAfterFeatureEvent (e, done) {
        return executeHooksWithArgs(this.afterFeature, [e.getPayloadItem('feature')]).then(done, (e) => {
            console.error(`afterFeature has thrown an error: ${e}`)
        })
    }
}

export default HookRunner
