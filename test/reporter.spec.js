import sinon from 'sinon'
import CucumberReporter from '../lib/reporter'

/**
 * create mocks
 */
let send
let reporter

function getEvent (name, status = 'pass', line = Math.round(Math.random() * 100)) {
    return {
        getPayloadItem: () => ({
            getName: () => name,
            getUriOf: () => 'foobar',
            getUri: () => 'foobar2',
            getStep: () => getEvent('step', status, line++).getPayloadItem(),
            getStatus: () => status,
            getFailureException: () => new Error('foobar-error'),
            getLine: () => line
        })
    }
}

const NOOP = () => {}

describe('cucumber reporter', () => {
    before(() => {
        reporter = new CucumberReporter({}, {}, '0-1', ['/foobar.js'])
        send = reporter.send = sinon.stub()
        send.returns(true)
    })

    describe('emits messages for certain cucumber events', () => {
        it('should send proper data on handleBeforeFeatureEvent', () => {
            reporter.handleBeforeFeatureEvent(getEvent('feature', 'pass', 123), NOOP)
            send.calledWithMatch({
                event: 'suite:start',
                type: 'suite',
                uid: 'feature123',
                file: 'foobar2',
                cid: '0-1'
            }).should.be.true()
        })

        it('should send proper data on handleBeforeScenarioEvent', () => {
            reporter.handleBeforeScenarioEvent(getEvent('scenario', 'pass', 124), NOOP)
            send.calledWithMatch({
                event: 'suite:start',
                type: 'suite',
                cid: '0-1',
                parent: 'feature123',
                uid: 'scenario124',
                file: 'foobar2'
            }).should.be.true()
        })

        it('should send proper data on handleBeforeStepEvent', () => {
            reporter.handleBeforeStepEvent(getEvent('step', 'fail', 125), NOOP)
            send.calledWithMatch({
                event: 'test:start',
                type: 'test',
                title: 'step',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step125',
                file: 'foobar2',
                duration: 0
            }).should.be.true()
        })

        it('should send proper data on handleStepResultEvent', () => {
            reporter.handleStepResultEvent(getEvent('step', 'failed', 126), NOOP)
            send.calledWithMatch({
                event: 'test:fail',
                type: 'test',
                title: 'step',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step126',
                file: 'foobar2'
            }).should.be.true()
            send.args[send.args.length - 1][0].err.message.should.be.equal('foobar-error')
        })

        it('should send proper data on handleAfterScenarioEvent', () => {
            reporter.handleAfterScenarioEvent(getEvent('scenario', null, 127), NOOP)
            send.calledWithMatch({
                event: 'suite:end',
                type: 'suite',
                cid: '0-1',
                parent: 'feature123',
                uid: 'scenario127',
                file: 'foobar2'
            }).should.be.true()
        })

        it('should send proper data on handleAfterFeatureEvent', () => {
            reporter.handleAfterFeatureEvent(getEvent('feature', null, 128), NOOP)
            send.calledWithMatch({
                event: 'suite:end',
                type: 'suite',
                title: 'feature',
                file: 'foobar2',
                uid: 'feature128',
                cid: '0-1',
                parent: null
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
            reporter.failedCount.should.be.exactly(1)
        })
    })
})
