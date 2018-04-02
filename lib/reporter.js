import { Status } from 'cucumber'
import { CucumberEventListener } from './cucumberEventListener'
import * as path from 'path'

const SETTLE_TIMEOUT = 5000

class CucumberReporter {
    gherkinDocEvents = []

    constructor (eventBroadcaster, options, cid, specs) {
        this.capabilities = options.capabilities
        this.tagsInTitle = options.tagsInTitle || false
        this.options = options
        this.cid = cid
        this.specs = specs
        this.failedCount = 0

        this.sentMessages = 0 // number of messages sent to the parent
        this.receivedMessages = 0 // number of messages received by the parent

        new CucumberEventListener(eventBroadcaster)
            .on('before-feature', this.handleBeforeFeature.bind(this))
            .on('before-scenario', this.handleBeforeScenario.bind(this))
            .on('before-step', this.handleBeforeStep.bind(this))
            .on('after-step', this.handleAfterStep.bind(this))
            .on('after-scenario', this.handleAfterScenario.bind(this))
            .on('after-feature', this.handleAfterFeature.bind(this))
    }

    handleBeforeFeature (uri, feature) {
        this.featureStart = new Date()

        this.emit('suite:start', {
            uid: this.getUniqueIdentifier(feature),
            title: this.getTitle(feature),
            type: 'suite',
            file: uri,
            tags: feature.tags
        })
    }

    handleBeforeScenario (uri, feature, scenario) {
        this.scenarioStart = new Date()
        this.testStart = new Date()

        this.emit('suite:start', {
            uid: this.getUniqueIdentifier(scenario),
            title: this.getTitle(scenario),
            parent: this.getUniqueIdentifier(feature),
            type: 'suite',
            file: uri,
            tags: scenario.tags
        })
    }

    handleBeforeStep (uri, feature, scenario, step) {
        this.testStart = new Date()

        this.emit('test:start', {
            uid: this.getUniqueIdentifier(step),
            title: step.text,
            type: 'test',
            file: uri,
            parent: this.getUniqueIdentifier(scenario),
            duration: new Date() - this.testStart,
            tags: scenario.tags,
            featureName: feature.name,
            scenarioName: scenario.name
        })
    }

    handleAfterStep (uri, feature, scenario, step, result) {
        let e = 'undefined'
        switch (result.status) {
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
        let stepTitle = step.text || step.keyword || 'Undefined Step'

        /**
         * if step name is undefined we are dealing with a hook
         * don't report hooks if no error happened
         */
        if (!step.text && result.status !== Status.FAILED) {
            return
        }

        if (result.status === Status.UNDEFINED) {
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
        } else if (result.status === Status.FAILED) {
            /**
             * cucumber failure exception can't get send to parent process
             * for some reasons
             */
            let err = result.exception
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
        } else if (result.status === Status.AMBIGUOUS && this.options.failAmbiguousDefinitions) {
            e = 'fail'
            this.failedCount++
            error = {
                message: result.exception
            }
        }

        this.emit('test:' + e, {
            uid: this.getUniqueIdentifier(step),
            title: stepTitle.trim(),
            type: 'test',
            file: uri,
            parent: this.getUniqueIdentifier(scenario),
            error: error,
            duration: new Date() - this.testStart,
            tags: scenario.tags
        })
    }

    handleAfterScenario (uri, feature, scenario) {
        this.emit('suite:end', {
            uid: this.getUniqueIdentifier(scenario),
            title: this.getTitle(scenario),
            parent: this.getUniqueIdentifier(feature),
            type: 'suite',
            file: uri,
            duration: new Date() - this.scenarioStart,
            tags: scenario.tags
        })
    }

    handleAfterFeature (uri, feature) {
        this.emit('suite:end', {
            uid: this.getUniqueIdentifier(feature),
            title: this.getTitle(feature),
            type: 'suite',
            file: uri,
            duration: new Date() - this.featureStart,
            tags: feature.tags
        })
    }

    emit (event, payload) {
        const message = {
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
            runner: {
                [this.cid]: this.capabilities
            },
            specs: this.specs,
            tags: payload.tags || [],
            featureName: payload.featureName,
            scenarioName: payload.scenarioName
        }

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

    getUriOf (type) {
        if (!type || !type.uri) {
            return
        }

        return type.uri.replace(process.cwd(), '')
    }

    getUniqueIdentifier (target) {
        if (target.type === 'Hook') {
            const name = path.basename(target.location.uri)
            const line = target.location.line

            return name + line
        }

        const name = target.name || target.text
        const location = target.location || target.locations[0]
        const line = (location && location.line) || ''

        return name + line
    }
}

export default CucumberReporter
