import Cucumber from 'cucumber'

const SETTLE_TIMEOUT = 5000
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
        this.tagsInTitle = options.tagsInTitle || false
        this.options = options
        this.cid = cid
        this.specs = specs
        this.failedCount = 0

        this.sentMessages = 0 // number of messages sent to the parent
        this.receivedMessages = 0 // number of messages received by the parent

        for (const fnName of CUCUMBER_EVENTS) {
            this.listener[fnName] = CucumberReporter.prototype[fnName].bind(this)
        }
    }

    handleBeforeFeatureEvent (event, callback) {
        const feature = event.getUri ? event : event.getPayloadItem('feature')
        this.featureStart = new Date()
        this.runningFeature = feature

        this.emit('suite:start', {
            uid: this.getUniqueIdentifier(feature),
            title: this.getTitle(feature),
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
            uid: this.getUniqueIdentifier(scenario),
            title: this.getTitle(scenario),
            parent: this.getUniqueIdentifier(this.runningFeature),
            type: 'suite',
            file: this.getUriOf(scenario)
        })

        process.nextTick(callback)
    }

    handleBeforeStepEvent (event, callback) {
        const step = event.getUri ? event : event.getPayloadItem('step')
        this.testStart = new Date()

        this.emit('test:start', {
            uid: this.getUniqueIdentifier(step),
            title: step.getName(),
            type: 'test',
            file: step.getUri(),
            parent: this.getUniqueIdentifier(this.runningScenario),
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
        case Cucumber.Status.AMBIGUOUS:
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
                    stack: `${step.getUri()}:${step.getLine()}`
                }
            }
        } else if (stepResult.getStatus() === Cucumber.Status.FAILED) {
            /**
             * cucumber failure exception can't get send to parent process
             * for some reasons
             */
            let err = stepResult.getFailureException()
            if (err instanceof Error) {
                error = {
                    message: err.message,
                    stack: err.stack
                }
            } else {
                error = {
                    message: err
                }
            }
            this.failedCount++
        } else if (stepResult.getStatus() === Cucumber.Status.AMBIGUOUS && this.options.failAmbiguousDefinitions) {
            e = 'fail'
            this.failedCount++
            error = {
                message: `Step "${stepTitle}" is ambiguous. The following steps matched the step definition`,
                stack: stepResult.getAmbiguousStepDefinitions().map(step => `${step.getPattern().toString()} in ${step.getUri()}:${step.getLine()}`).join('\n')
            }
        }

        this.emit('test:' + e, {
            uid: this.getUniqueIdentifier(step),
            title: stepTitle.trim(),
            type: 'test',
            file: this.getUriOf(step),
            parent: this.getUniqueIdentifier(this.runningScenario),
            error: error,
            duration: new Date() - this.testStart
        })

        process.nextTick(callback)
    }

    handleAfterScenarioEvent (event, callback) {
        const scenario = event.getUri ? event : event.getPayloadItem('scenario')
        this.emit('suite:end', {
            uid: this.getUniqueIdentifier(scenario),
            title: scenario.getName(),
            parent: this.getUniqueIdentifier(this.runningFeature),
            type: 'suite',
            file: this.getUriOf(scenario),
            duration: new Date() - this.scenarioStart
        })

        process.nextTick(callback)
    }

    handleAfterFeatureEvent (event, callback) {
        const feature = event.getUri ? event : event.getPayloadItem('feature')
        this.emit('suite:end', {
            uid: this.getUniqueIdentifier(feature),
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
            uid: payload.uid,
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

        this.send(message, null, {}, () => ++this.receivedMessages)
        this.sentMessages++
    }

    send (...args) {
        return process.send.apply(process, args)
    }

    /**
     * wait until all messages were sent to parent
     */
    waitUntilSettled () {
        return new Promise((resolve) => {
            const start = (new Date()).getTime()
            const interval = setInterval(() => {
                const now = (new Date()).getTime()

                if (this.sentMessages !== this.receivedMessages && now - start < SETTLE_TIMEOUT) return
                clearInterval(interval)
                resolve()
            }, 100)
        })
    }

    getTitle (featureOrScenario) {
        const name = featureOrScenario.getName()
        const tags = featureOrScenario.getTags()
        if (!this.tagsInTitle || !tags.length) return name
        return `${tags.map(tag => tag.getName()).join(', ')}: ${name}`
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

    getUniqueIdentifier (target) {
        return target.getName() +
                (target.getLine() || '')
    }
}

export default CucumberReporter
