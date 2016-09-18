var assert = require('assert')

module.exports = function () {
    this.Given(/Test will fail/, (url) => {
        return assert.ok(false, 'expected failure')
    })

    this.Given('Pending test', () => 'pending')

    this.Then(/this step will be skipped/, (selector) => {
        throw new Error('unexpected error')
    })
}
