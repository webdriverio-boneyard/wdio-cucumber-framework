import configSyncAsync from './fixtures/sync-async.conf'
import configAsync from './fixtures/async-step-definitions.conf'
import { CucumberAdapter } from '../lib/adapter'

const specs = ['./test/fixtures/sample.feature']
const syncAsyncSpecs = ['./test/fixtures/sync-async.feature']

const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    /**
     * task of this command is to add 1 so we can have a simple demo test like
     * browser.command(1).should.be.equal(2)
     */
    url: () => new Promise((r) => {
        setTimeout(() => r(), 2000)
    }),
    click: () => new Promise((r) => {
        setTimeout(() => r(), 2000)
    }),
    getTitle: (ms = 500) => new Promise((r) => {
        setTimeout(() => r('Google'), ms)
    }),
    pause: (ms = 500) => new Promise((r) => {
        setTimeout(() => r(), ms)
    })
}

process.send = NOOP

let timeToExecute
describe('syncAsyncTest', () => {
    describe('executes step definitions async', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            global.browser.options = { sync: false }
            const adapter = new CucumberAdapter(0, configAsync, specs, {})
            global.browser.getPrototype = () => WebdriverIO.prototype

            const start = new Date().getTime();
            (await adapter.run()).should.be.equal(0, 'actual test failed')
            timeToExecute = new Date().getTime() - start
        })

        it('should take the expected amount of time to execute suite', () => {
            timeToExecute.should.be.above(4500)
        })
    })

    describe('executes step definitions sync or async', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            const adapter = new CucumberAdapter(0, configSyncAsync, syncAsyncSpecs, {})
            global.browser.getPrototype = () => WebdriverIO.prototype

            const start = new Date().getTime();
            (await adapter.run()).should.be.equal(0, 'actual test failed')
            timeToExecute = new Date().getTime() - start
        })

        it('should take the expected amount of time to execute suite', () => {
            timeToExecute.should.be.above(7000)
        })
    })
})
