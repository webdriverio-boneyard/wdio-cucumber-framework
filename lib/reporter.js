import { Status } from 'cucumber'

const SETTLE_TIMEOUT = 5000
const CUCUMBER_EVENTS = [
    'handleBeforeFeature', 'handleAfterFeature',
    'handleBeforeScenario', 'handleAfterScenario',
    'handleBeforeStep', 'handleStepResult'
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

    handleBeforeFeature (event, callback) {
        const feature = event
        this.featureStart = new Date()
        this.runningFeature = feature

        this.emit('suite:start', {
            uid: this.getUniqueIdentifier(feature),
            title: this.getTitle(feature),
            type: 'suite',
            file: this.getUriOf(feature),
            tags: feature.tags
        })

        process.nextTick(callback)
    }

    handleBeforeScenario (event, callback) {
        const scenario = event
        this.runningScenario = scenario
        this.scenarioStart = new Date()
        this.testStart = new Date()

        this.emit('suite:start', {
            uid: this.getUniqueIdentifier(scenario),
            title: this.getTitle(scenario),
            parent: this.getUniqueIdentifier(this.runningFeature),
            type: 'suite',
            file: this.getUriOf(scenario),
            tags: scenario.tags
        })

        process.nextTick(callback)
    }

    handleBeforeStep (event, callback) {
        const step = event
        this.testStart = new Date()

        this.emit('test:start', {
            uid: this.getUniqueIdentifier(step),
            title: step.name,
            type: 'test',
            file: step.uri,
            parent: this.getUniqueIdentifier(this.runningScenario),
            duration: new Date() - this.testStart,
            tags: this.runningScenario.tags,
            featureName: this.runningFeature.name,
            scenarioName: this.runningScenario.name
        })

        process.nextTick(callback)
    }

    handleStepResult (event, callback) {
        const stepResult = event
        let step = stepResult.step
        let e = 'undefined'
        switch (stepResult.status) {
        case Status.FAILED:
        case Status.UNDEFINED:
            e = 'fail'
            break
        case Status.PASSED:
            e = 'pass'
            break
        case Status.PENDING:
        case Status.SKIPPED:
        case Status.AMBIGUOUS:
            e = 'pending'
        }
        let error = {}
        let stepTitle = step.name || step.keyword || 'Undefined Step'

        /**
         * if step name is undefined we are dealing with a hook
         * don't report hooks if no error happened
         */
        if (!step.name && stepResult.status !== Status.FAILED) {
            return process.nextTick(callback)
        }

        if (stepResult.status === Status.UNDEFINED) {
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
                    stack: `${step.uri}:${step.line}`
                }
            }
        } else if (stepResult.status === Status.FAILED) {
            /**
             * cucumber failure exception can't get send to parent process
             * for some reasons
             */
            let err = stepResult.failureException
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
        } else if (stepResult.status === Status.AMBIGUOUS && this.options.failAmbiguousDefinitions) {
            e = 'fail'
            this.failedCount++
            error = {
                message: `Step "${stepTitle}" is ambiguous. The following steps matched the step definition`,
                stack: stepResult.ambiguousStepDefinitions.map(step => `${step.pattern.toString()} in ${step.uri}:${step.line}`).join('\n')
            }
        }

        this.emit('test:' + e, {
            uid: this.getUniqueIdentifier(step),
            title: stepTitle.trim(),
            type: 'test',
            file: this.getUriOf(step),
            parent: this.getUniqueIdentifier(this.runningScenario),
            error: error,
            duration: new Date() - this.testStart,
            tags: this.runningScenario.tags
        })

        process.nextTick(callback)
    }

    handleAfterScenario (event, callback) {
        const scenario = event
        this.emit('suite:end', {
            uid: this.getUniqueIdentifier(scenario),
            title: scenario.name,
            parent: this.getUniqueIdentifier(this.runningFeature),
            type: 'suite',
            file: this.getUriOf(scenario),
            duration: new Date() - this.scenarioStart,
            tags: scenario.tags
        })

        process.nextTick(callback)
    }

    handleAfterFeature (event, callback) {
        const feature = event
        this.emit('suite:end', {
            uid: this.getUniqueIdentifier(feature),
            title: feature.name,
            type: 'suite',
            file: this.getUriOf(feature),
            duration: new Date() - this.featureStart,
            tags: feature.tags
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
            specs: this.specs,
            tags: payload.tags || [],
            featureName: payload.featureName,
            scenarioName: payload.scenarioName
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
        const name = featureOrScenario.name
        const tags = featureOrScenario.tags
        if (!this.tagsInTitle || !tags.length) return name
        return `${tags.map(tag => tag.name).join(', ')}: ${name}`
    }

    getListener () {
        return this.listener
    }

    getUriOf (type) {
        if (!type || !type.uri) {
            return
        }

        return type.uri.replace(process.cwd(), '')
    }

    getUniqueIdentifier (target) {
        return target.name +
                (target.line || '')
    }
}

export default CucumberReporter
