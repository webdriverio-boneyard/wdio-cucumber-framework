import sinon from 'sinon'
import CucumberReporter from '../lib/reporter'
import { EventEmitter } from 'events'

let send
let eventBroadcaster
let reporter

const gherkinDocEvent = {
    uri: './any.feature',
    document: {
        type: 'GherkinDocument',
        feature: {
            type: 'Feature',
            tags: [
                { name: '@feature-tag1' },
                { name: '@feature-tag2' }
            ],
            location: { line: 123, column: 1 },
            keyword: 'Feature',
            name: 'feature',
            children: [{
                type: 'Scenario',
                tags: [
                    { name: '@scenario-tag1' },
                    { name: '@scenario-tag2' }
                ],
                location: { line: 124, column: 0 },
                keyword: 'Scenario',
                name: 'scenario',
                steps: [
                    {
                        location: { line: 125, column: 1 },
                        keyword: 'Given ',
                        text: 'step-title-passing'
                    },
                    {
                        location: { line: 126, column: 1 },
                        keyword: 'When ',
                        text: 'step-title-failing'
                    }
                ]
            }]
        }
    }
}

describe('cucumber reporter', () => {
    before(() => {
        eventBroadcaster = new EventEmitter()
        reporter = new CucumberReporter(eventBroadcaster, { failAmbiguousDefinitions: true }, '0-1', ['/foobar.js'])
        send = reporter.send = sinon.stub()
        send.returns(true)
    })

    describe('emits messages for certain cucumber events', () => {
        it('should send proper data on `gherkin-document` event', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)

            sinon.assert.calledWithMatch(send, {
                event: 'suite:start',
                type: 'suite',
                uid: 'feature123',
                file: './any.feature',
                cid: '0-1',
                tags: [
                    { name: '@feature-tag1' },
                    { name: '@feature-tag2' }
                ]
            })
        })

        it('should send proper data on `pickle-accepted` event', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('pickle-accepted', {
                uri: gherkinDocEvent.uri,
                pickle: {
                    tags: [{ name: 'abc' }],
                    name: 'scenario',
                    locations: [{ line: 124, column: 1 }],
                    steps: [{
                        locations: [{ line: 125, column: 1 }],
                        keyword: 'Given ',
                        text: 'I go on the website "http://webdriver.io" the async way'
                    }]
                }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'suite:start',
                type: 'suite',
                cid: '0-1',
                parent: 'feature123',
                uid: 'scenario124',
                file: './any.feature',
                tags: [{ name: 'abc' }]
            })
        })

        it('should send proper data on `test-step-started` event', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('test-step-started', {
                index: 0,
                testCase: {
                    sourceLocation: { uri: gherkinDocEvent.uri, line: 124 }
                }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'test:start',
                type: 'test',
                title: 'step-title-passing',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step-title-passing125',
                file: './any.feature',
                duration: 0,
                tags: [
                    { name: '@scenario-tag1' },
                    { name: '@scenario-tag2' }
                ],
                featureName: 'feature',
                scenarioName: 'scenario'
            })
        })

        it('should send proper data on successful `test-step-finished` event', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('test-step-finished', {
                index: 0,
                result: { duration: 10, status: 'passed' },
                testCase: {
                    sourceLocation: { uri: gherkinDocEvent.uri, line: 124 }
                }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'test:pass',
                type: 'test',
                title: 'step-title-passing',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step-title-passing125',
                file: './any.feature',
                tags: [
                    { name: '@scenario-tag1' },
                    { name: '@scenario-tag2' }
                ]
            })
        })

        it('should send proper data on failing `test-step-finished` event with exception', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('test-step-finished', {
                index: 1,
                result: {
                    duration: 10,
                    status: 'failed',
                    exception: new Error('exception-error')
                },
                testCase: {
                    sourceLocation: { uri: gherkinDocEvent.uri, line: 124 }
                }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'test:fail',
                type: 'test',
                title: 'step-title-failing',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step-title-failing126',
                file: './any.feature',
                tags: [
                    { name: '@scenario-tag1' },
                    { name: '@scenario-tag2' }
                ]
            })
            send.args[send.args.length - 1][0].err.message.should.be.equal('exception-error')
        })

        it('should send proper data on failing `test-step-finished` event with string error', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('test-step-finished', {
                index: 1,
                result: {
                    duration: 10,
                    status: 'failed',
                    exception: 'string-error'
                },
                testCase: {
                    sourceLocation: { uri: gherkinDocEvent.uri, line: 124 }
                }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'test:fail',
                type: 'test',
                title: 'step-title-failing',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step-title-failing126',
                file: './any.feature',
                tags: [
                    { name: '@scenario-tag1' },
                    { name: '@scenario-tag2' }
                ]
            })
            send.args[send.args.length - 1][0].err.message.should.be.equal('string-error')
        })

        it('should send proper data on ambiguous `test-step-finished` event', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('test-step-finished', {
                index: 1,
                result: {
                    duration: 10,
                    status: 'ambiguous',
                    exception: 'cucumber-ambiguous-error-message'
                },
                testCase: {
                    sourceLocation: { uri: gherkinDocEvent.uri, line: 124 }
                }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'test:fail',
                type: 'test',
                title: 'step-title-failing',
                cid: '0-1',
                parent: 'scenario124',
                uid: 'step-title-failing126',
                file: './any.feature',
                tags: [
                    { name: '@scenario-tag1' },
                    { name: '@scenario-tag2' }
                ]
            })
            send.args[send.args.length - 1][0].err.message.should.be.equal('cucumber-ambiguous-error-message')
        })

        it('should send proper data on `test-case-finished` event', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('test-case-finished', {
                result: { duration: 0, status: 'passed' },
                sourceLocation: { uri: gherkinDocEvent.uri, line: 124 }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'suite:end',
                type: 'suite',
                cid: '0-1',
                parent: 'feature123',
                uid: 'scenario124',
                file: './any.feature',
                tags: [
                    { name: '@scenario-tag1' },
                    { name: '@scenario-tag2' }
                ]
            })
        })

        it('should send proper data on `test-run-finished` event', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('test-run-finished', {
                result: { duration: 0, success: true }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'suite:end',
                type: 'suite',
                title: 'feature',
                file: './any.feature',
                uid: 'feature123',
                cid: '0-1',
                parent: null,
                tags: [
                    { name: '@feature-tag1' },
                    { name: '@feature-tag2' }
                ]
            })
        })
    })

    describe('make sure all commands are sent properly', () => {
        // TODO this spec is not isolated and requires other specs above to run in advance
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
            reporter = new CucumberReporter(eventBroadcaster, {
                tagsInTitle: true
            }, '0-1', ['/foobar.js'])
            send = reporter.send = sinon.stub()
            send.returns(true)
        })

        it('should add tags on handleBeforeFeatureEvent', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)

            sinon.assert.calledWithMatch(send, {
                event: 'suite:start',
                type: 'suite',
                title: '@feature-tag1, @feature-tag2: feature',
                uid: 'feature123',
                file: './any.feature',
                cid: '0-1'
            })
        })

        it('should add tags on handleBeforeScenarioEvent', () => {
            eventBroadcaster.emit('gherkin-document', gherkinDocEvent)
            send.reset()

            eventBroadcaster.emit('pickle-accepted', {
                uri: gherkinDocEvent.uri,
                pickle: {
                    tags: [
                        { name: '@scenario-tag1' },
                        { name: '@scenario-tag2' }
                    ],
                    name: 'scenario',
                    locations: [{ line: 124, column: 1 }],
                    steps: [{
                        locations: [{ line: 125, column: 1 }],
                        keyword: 'Given ',
                        text: 'I go on the website "http://webdriver.io" the async way'
                    }]
                }
            })

            sinon.assert.calledWithMatch(send, {
                event: 'suite:start',
                type: 'suite',
                title: '@scenario-tag1, @scenario-tag2: scenario',
                uid: 'scenario124',
                file: './any.feature',
                cid: '0-1'
            })
        })
    })
})
