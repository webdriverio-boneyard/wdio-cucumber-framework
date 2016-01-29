var assert = require('assert')

module.exports = function () {
    this.Given(/^I go on the website "([^"]*)"$/, (url) => {
        return browser.url(url)
    })

    this.Then(/^I click on link "([^"]*)"$/, (selector) => {
        return browser.click(selector)
    })

    this.Then(/^should the title of the page be "([^"]*)"$/, (expectedTitle) => {
        return browser.getTitle().then((title) => {
            assert.equal(title, expectedTitle)
        })
    })
}
