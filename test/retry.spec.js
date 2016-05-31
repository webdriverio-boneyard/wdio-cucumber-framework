import { CucumberAdapter } from '../lib/adapter'

const conf = {
    cucumberOpts: {
        timeout: 15000,
        require: [__dirname + '/fixtures/retry-step-definition.js']
    }
}
const feature = ['./test/fixtures/retry.feature']

const NOOP = () => {}

const WebdriverIO = class {}
WebdriverIO.prototype = {
    /**
     * task of this command is to add 1 so we can have a simple demo test like
     * browser.command(1).should.be.equal(2)
     */
    url: () => new Promise((r) => {
        setTimeout(() => r('url'), 1000)
    }),
    click: () => new Promise((r) => {
        setTimeout(() => r('click'), 1000)
    }),
    getTitle: (ms = 500) => new Promise((r) => {
        setTimeout(() => r('Google'), 1000)
    }),
    pause: (ms = 500) => new Promise((r) => {
        setTimeout(() => r('pause'), 1000)
    })
}

process.send = NOOP

let timeToExecute
describe('retryTest', () => {
    describe('can retry failed step definitions', () => {
        before(async () => {
            global.browser = new WebdriverIO()
            const adapter = new CucumberAdapter(0, conf, feature, {})
            global.browser.getPrototype = () => WebdriverIO.prototype

            const start = new Date().getTime();
            (await adapter.run()).should.be.equal(0, 'actual test failed')
            timeToExecute = new Date().getTime() - start
        })

        it('should take the expected amount of time to execute suite', () => {
            timeToExecute.should.be.above(10000)
        })
    })
})
