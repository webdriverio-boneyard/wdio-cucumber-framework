import Cucumber from 'cucumber'

const CUCUMBER_EVENTS = [
    'handleBeforeFeatureEvent', 'handleAfterFeatureEvent',
    'handleBeforeScenarioEvent', 'handleAfterScenarioEvent',
    'handleBeforeStepEvent', 'handleStepResultEvent'
]

/**
 * Custom Cucumber Reporter
 */
class CucumberReporter {
    constructor (BaseListener, options, cid, specs) {
        this.listener = BaseListener
        this.capabilities = options.capabilities
        this.options = options
        this.cid = cid
        this.specs = specs
        this.failedCount = 0

        for (const fnName of CUCUMBER_EVENTS) {
            this.listener[fnName] = CucumberReporter.prototype[fnName].bind(this)
        }
    }

    handleBeforeFeatureEvent (event, callback) {
        const feature = event.getUri ? event : event.getPayloadItem('feature')
        this.featureStart = new Date()
        this.runningFeature = feature

        this.emit('suite:start', {
            title: feature.getName(),
            type: 'suite',
            file: this.getUriOf(feature)
        })

        process.nextTick(callback)
    }

    handleBeforeScenarioEvent (event, callback) {
        const scenario = event.getUri ? event : event.getPayloadItem('scenario')
        this.runningScenario = scenario
        this.scenarioStart = new Date()
        this.testStart = new Date()

        this.emit('suite:start', {
            title: scenario.getName(),
            parent: this.runningFeature.getName(),
            type: 'suite',
            file: this.getUriOf(scenario)
        })

        process.nextTick(callback)
    }

    handleBeforeStepEvent (event, callback) {
        const step = event.getUri ? event : event.getPayloadItem('step')
        this.testStart = new Date()

        this.emit('test:start', {
            title: step.getName(),
            type: 'test',
            file: step.getUri(),
            parent: this.runningScenario.getName(),
            duration: new Date() - this.testStart
        })

        process.nextTick(callback)
    }

    handleStepResultEvent (event, callback) {
        const stepResult = event.getStep ? event : event.getPayloadItem('stepResult')
        let step = stepResult.getStep()
        let e = 'undefined'

        switch (stepResult.getStatus()) {
        case Cucumber.Status.FAILED:
        case Cucumber.Status.UNDEFINED:
            e = 'fail'
            break
        case Cucumber.Status.PASSED:
            e = 'pass'
            break
        case Cucumber.Status.PENDING:
        case Cucumber.Status.SKIPPED:
            e = 'pending'
        }
        let error = {}
        let stepTitle = step.getName() || step.getKeyword() || 'Undefined Step'

        /**
         * if step name is undefined we are dealing with a hook
         * don't report hooks if no error happened
         */
        if (!step.getName() && stepResult.getStatus() !== Cucumber.Status.FAILED) {
            return process.nextTick(callback)
        }

        if (stepResult.getStatus() === Cucumber.Status.UNDEFINED) {
            if (this.options.ignoreUndefinedDefinitions) {
                /**
                 * mark test as pending
                 */
                e = 'pending'
                stepTitle += ' (undefined step)'
            } else {
                /**
                 * mark test as failed
                 */
                this.failedCount++

                error = {
                    message: `Step "${stepTitle}" is not defined. You can ignore this error by setting
                              cucumberOpts.ignoreUndefinedDefinitions as true.`,
                    stack: step.getUri() + ':' + step.getLine()
                }
            }
        } else if (stepResult.getStatus() === Cucumber.Status.FAILED) {
            /**
             * cucumber failure exception can't get send to parent process
             * for some reasons
             */
            let err = stepResult.getFailureException()
            error = {
                message: err.message,
                stack: err.stack
            }
            this.failedCount++
        }

        this.emit('test:' + e, {
            title: stepTitle.trim(),
            type: 'test',
            file: this.getUriOf(step),
            parent: this.runningScenario.getName(),
            error: error,
            duration: new Date() - this.testStart
        })

        process.nextTick(callback)
    }

    handleAfterScenarioEvent (event, callback) {
        const scenario = event.getUri ? event : event.getPayloadItem('scenario')
        this.emit('suite:end', {
            title: scenario.getName(),
            parent: this.runningFeature.getName(),
            type: 'suite',
            file: this.getUriOf(scenario),
            duration: new Date() - this.scenarioStart
        })

        process.nextTick(callback)
    }

    handleAfterFeatureEvent (event, callback) {
        const feature = event.getUri ? event : event.getPayloadItem('feature')
        this.emit('suite:end', {
            title: feature.getName(),
            type: 'suite',
            file: this.getUriOf(feature),
            duration: new Date() - this.featureStart
        })

        process.nextTick(callback)
    }

    emit (event, payload) {
        let message = {
            event: event,
            cid: this.cid,
            title: payload.title,
            pending: payload.pending || false,
            parent: payload.parent || null,
            type: payload.type,
            file: payload.file,
            err: payload.error || {},
            duration: payload.duration,
            runner: {},
            specs: this.specs
        }

        message.runner[this.cid] = this.capabilities
        this.send(message)
    }

    send (message) {
        return process.send(message)
    }

    getListener () {
        return this.listener
    }

    getUriOf (type) {
        if (!type || !type.getUri()) {
            return
        }

        return type.getUri().replace(process.cwd(), '')
    }
}

export default CucumberReporter
