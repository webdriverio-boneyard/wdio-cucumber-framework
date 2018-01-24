import sinon from 'sinon'
import CucumberReporter from '../lib/reporter'

/**
 * create mocks
 */
let send
let reporter

function getEvent (name, status = 'pass', line = Math.round(Math.random() * 100), tags = [], err = new Error('foobar-error'), isStepInsideStep) {
    return {
        line,
        name,
        status,
        uri: 'foobar2',
        step: isStepInsideStep ? null : getEvent('step', status, line++, [], new Error('foobar-error'), true),
        tags: tags.map(tag => ({ name: tag })),
        failureException: err
    }
}

const NOOP = () => {}

describe('cucumber reporter', () => {
    before(() => {
        reporter = new CucumberReporter({}, {failAmbiguousDefinitions: true}, '0-1', ['/foobar.js'])
        send = reporter.send = sinon.stub()
        send.returns(true)
    })

    describe('emits messages for certain cucumber events', () => {
        it('should send proper data on handleBeforeFeatureEvent', () => {
            reporter.handleBeforeFeature(getEvent('feature', 'pass', 123, ['abc']), NOOP)

            send.calledWithMatch({
                event: 'suite:start',
                type: 'suite',
                uid: 'feature123',
                file: 'foobar2',
                cid: '0-1',
                tags: [{
                    name: 'abc'
                }]
            }).should.be.true()
        })

        it('should send proper data on handleBeforeScenarioEvent', () => {
            reporter.handleBeforeScenario(getEvent('scenario', 'pass', 124, ['abc']), NOOP)
            send.calledWithMatch({
                event: 'suite:start',
                type: 'suite',
                cid: '0-1',
                parent: 'feature123',
                uid: 'scenario124',
                file: 'foobar2',
                tags: [{
                    name: 'abc'
                }]
            }).should.be.true()
        })

        it('should send proper data on handleBeforeStepEvent', () => {
            reporter.handleBeforeStep(getEvent('step', 'fail', 125, ['abc']), NOOP)
            send.calledWithMatch({
                event: 'test:start',
                type: 'test',
                title: 'step',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step125',
                file: 'foobar2',
                duration: 0,
                tags: [{
                    name: 'abc'
                }],
                featureName: 'feature',
                scenarioName: 'scenario'
            }).should.be.true()
        })

        it('should send proper data on handleStepResultEvent for error of error type', () => {
            reporter.handleStepResult(getEvent('step', 'failed', 126, ['abc']), NOOP)
            send.calledWithMatch({
                event: 'test:fail',
                type: 'test',
                title: 'step',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step126',
                file: 'foobar2',
                tags: [{
                    name: 'abc'
                }]
            }).should.be.true()
            send.args[send.args.length - 1][0].err.message.should.be.equal('foobar-error')
        })

        it('should send proper data on handleStepResultEvent for error of string type', () => {
            reporter.handleStepResult(getEvent('step', 'failed', 126, ['abc'], 'foo-error'), NOOP)
            send.calledWithMatch({
                event: 'test:fail',
                type: 'test',
                title: 'step',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step126',
                file: 'foobar2',
                tags: [{
                    name: 'abc'
                }]
            }).should.be.true()
            send.args[send.args.length - 1][0].err.message.should.be.equal('foo-error')
        })

        it('should send proper data on handleStepResultEvent for ambiguous step error', () => {
            const event = getEvent('step', 'ambiguous', 131, [])
            event.ambiguousStepDefinitions = [
                {line: 5, pattern: /^Foo Bar Doo$/, uri: 'foobar1'},
                {line: 42, pattern: /^Foo Bar Doo$/, uri: 'foobar2'}]

            reporter.handleStepResult(event, NOOP)
            send.calledWithMatch({
                event: 'test:fail',
                type: 'test',
                title: 'step',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step126',
                file: 'foobar2',
                tags: [{
                    name: 'abc'
                }]
            }).should.be.true()

            send.args[send.args.length - 1][0].err.message.should.be.equal(
                'Step "step" is ambiguous. The following steps matched the step definition')
            send.args[send.args.length - 1][0].err.stack.should.be.equal(
                '/^Foo Bar Doo$/ in foobar1:5\n/^Foo Bar Doo$/ in foobar2:42')
        })

        it('should send proper data on handleAfterScenarioEvent', () => {
            reporter.handleAfterScenario(getEvent('scenario', null, 127, ['abc']), NOOP)
            send.calledWithMatch({
                event: 'suite:end',
                type: 'suite',
                cid: '0-1',
                parent: 'feature123',
                uid: 'scenario127',
                file: 'foobar2',
                tags: [{
                    name: 'abc'
                }]
            }).should.be.true()
        })

        it('should send proper data on handleAfterFeatureEvent', () => {
            reporter.handleAfterFeature(getEvent('feature', null, 128, ['abc']), NOOP)
            send.calledWithMatch({
                event: 'suite:end',
                type: 'suite',
                title: 'feature',
                file: 'foobar2',
                uid: 'feature128',
                cid: '0-1',
                parent: null,
                tags: [{
                    name: 'abc'
                }]
            }).should.be.true()
        })
    })

    describe('make sure all commands are sent properly', () => {
        it('should wait until all events were sent', () => {
            const start = (new Date()).getTime()
            setTimeout(() => {
                send.args.forEach((arg) => arg[3]())
            }, 500)

            return reporter.waitUntilSettled().then(() => {
                const end = (new Date()).getTime();
                (end - start).should.be.greaterThan(500)
            })
        })
    })

    describe('provides a fail counter', () => {
        it('should have right fail count at the end', () => {
            reporter.failedCount.should.be.exactly(3)
        })
    })

    describe('tags in title', () => {
        before(() => {
            reporter = new CucumberReporter({}, {
                tagsInTitle: true
            }, '0-1', ['/foobar.js'])
            send = reporter.send = sinon.stub()
            send.returns(true)
        })

        it('should add tags on handleBeforeFeatureEvent', () => {
            reporter.handleBeforeFeature(getEvent('feature', 'pass', 129, ['@tag_1', '@tag_2']), NOOP)

            send.calledWithMatch({
                event: 'suite:start',
                type: 'suite',
                title: '@tag_1, @tag_2: feature',
                uid: 'feature129',
                file: 'foobar2',
                cid: '0-1'
            }).should.be.true()
        })

        it('should add tags on handleBeforeScenarioEvent', () => {
            reporter.handleBeforeScenario(getEvent('scenario', 'pass', 130, ['@tag_1']), NOOP)

            send.calledWithMatch({
                event: 'suite:start',
                type: 'suite',
                title: '@tag_1: scenario',
                uid: 'scenario130',
                file: 'foobar2',
                cid: '0-1'
            }).should.be.true()
        })
    })
})
