var assert = require('assert')

let retryTest = 0
let lastCommand

global.syncAsync = {}

module.exports = function () {
    this.Given(/^I go on the website "([^"]*)" that can fail one time$/, { retry: 1 }, (url) => {
        let res = browser.url(url)
        if (retryTest !== 0) {
            retryTest--
            throw new Error('FLAKE!')
        }
        lastCommand = res
    })

    this.Given(/^I set retryTest to "([^"]*)"$/, (cnt) => {
        retryTest = parseInt(cnt, 10)
    })

    this.Given(/^I go on the website "([^"]*)" the async way$/, { retry: 3 }, function async (url) {
        return browser.url(url).then((res) => {
            if (retryTest !== 0) {
                retryTest--
                throw new Error('FLAKE!')
            }
            lastCommand = res
        })
    })

    this.Then(/^should the title of the page be "([^"]*)"$/, { retry: 2 }, (expectedTitle) => {
        let title = browser.getTitle()
        if (retryTest !== 0) {
            retryTest--
            throw new Error('FLAKE!')
        }
        assert.equal(title, expectedTitle)
        lastCommand = 'getTitle'
    })

    this.Then(/^I click on link "([^"]*)" the async way$/, { retry: 2 }, function async (selector) {
        if (retryTest !== 0) {
            retryTest--
            throw new Error('FLAKE!')
        }
        lastCommand = 'click'
        return browser.click(selector)
    })

    this.Then(/^the last command should be "([^"]*)"$/, (expectedLastCommand) => {
        assert.equal(expectedLastCommand, lastCommand)
        lastCommand = null
    })
}
