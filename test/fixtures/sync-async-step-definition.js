var assert = require('assert')

global.syncAsync = {}

module.exports = function () {
    this.Given(/^I go on the website "([^"]*)"$/, (url) => {
        browser.url(url)
    })

    this.Then(/^I click on link "([^"]*)"$/, (selector) => {
        browser.click(selector)
    })

    this.Then(/^should the title of the page be "([^"]*)"$/, (expectedTitle) => {
        assert.equal(browser.getTitle(), expectedTitle)
    })

    this.Given(/^I go on the website "([^"]*)" the async way$/, function async (url) {
        let promise = browser.url(url)
        assert.equal(typeof promise.then, 'function')
        return promise
    })

    this.Then(/^I click on link "([^"]*)" the async way$/, function async (selector) {
        let promise = browser.click(selector)
        assert.equal(typeof promise.then, 'function')
        return promise
    })

    this.Then(/^should the title of the page be "([^"]*)" the async way$/, function async (expectedTitle) {
        return browser.getTitle().then((title) => {
            assert.equal(title, expectedTitle)
        })
    })
}
