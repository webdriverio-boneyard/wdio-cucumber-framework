import { CucumberAdapter } from '../lib/adapter'
import CucumberReporter from '../lib/reporter'
import config from './fixtures/steps-status.conf'

const specs = ['./test/fixtures/steps-status.feature']

const WebdriverIO = class {}

describe('steps', () => {
    it('should report different status for steps', async () => {
        const messages = []
        const send = CucumberReporter.prototype.send
        CucumberReporter.prototype.send = message => messages.push(message)
        global.browser = new WebdriverIO()
        global.browser.options = config
        const adapter = new CucumberAdapter(0, config, specs, {})

        ;(await adapter.run()).should.be.equal(1)

        messages.map(msg => msg.event).should.be.deepEqual([
            'suite:start',

            // failed
            'suite:start',
            'test:start',
            'test:fail',
            'test:start',
            'test:skipped',
            'test:start',
            'test:skipped',
            'suite:end',

            // pending
            'suite:start',
            'test:start',
            'test:pending',
            'suite:end',

            'suite:end'
        ])

        CucumberReporter.prototype.send = send
    })
})
