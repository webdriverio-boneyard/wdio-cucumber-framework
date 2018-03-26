var assert = require('assert')
var { Given, Then } = require('cucumber')

Given('I go on the website {string}', (url) => {
    browser.url(url)
})

Then('I click on link {string}', (selector) => {
    browser.click(selector)
})

Then('should the title of the page be {string}', (expectedTitle) => {
    assert.equal(browser.getTitle(), expectedTitle)
})
