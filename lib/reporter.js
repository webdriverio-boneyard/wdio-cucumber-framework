/**
 * Custom Cucumber Reporter
 */
class CucumberReporter {

    custructor (BaseListener, options) {
        this.listener = BaseListener
        this.capabilities = options.capabilities
        this.options = options
        this.failedCount = 0

        Object.keys(CucumberReporter.prototype).forEach((fnName) =>
            this.listener[fnName] = CucumberReporter.prototype[fnName].bind(this))
    }

    handleBeforeFeatureEvent (event, callback) {
        let feature = event.getPayloadItem('feature')
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
        let scenario = event.getPayloadItem('scenario')
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

    handleStepResultEvent (event, callback) {
        let stepResult = event.getPayloadItem('stepResult')
        let step = stepResult.getStep()
        let e = stepResult.isSuccessful() ? 'pass' : stepResult.isFailed() || stepResult.isUndefined() ? 'fail'
                : stepResult.isPending() || stepResult.isSkipped() ? 'pending' : 'undefined'
        let error = {}
        let stepTitle = step.getName() || step.getKeyword() || 'Undefined Step'

        /**
         * if step name is undefined we are dealing with a hook
         * don't report hooks if no error happened
         */
        if (!step.getName() && !stepResult.isFailed()) {
            return process.nextTick(callback)
        }

        if (stepResult.isUndefined()) {
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
        } else if (stepResult.isFailed()) {
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

        this.testStart = new Date()
        process.nextTick(callback)
    }

    handleAfterScenarioEvent (event, callback) {
        let scenario = event.getPayloadItem('scenario')

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
        let feature = event.getPayloadItem('feature')

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
            pid: process.pid,
            title: payload.title,
            pending: payload.pending || false,
            parent: payload.parent || null,
            type: payload.type,
            file: payload.file,
            err: payload.error || {},
            duration: payload.duration,
            runner: {}
        }

        message.runner[process.pid] = this.capabilities
        process.send(message)
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

export { CucumberReporter }
