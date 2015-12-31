/**
 * to run these tests you need install Cucumber.js on your machine
 * take a look at https://github.com/cucumber/cucumber-js for more informations
 *
 * first, install Cucumber.js via NPM
 * $ npm install -g cucumber
 *
 * then go into the cucumber directory and start the tests with
 * $ cucumber.js
 */

var assert = require('assert')

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
}
