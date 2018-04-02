const assert = require('assert')
const {Given, Then, Before, BeforeAll, After, AfterAll} = require('cucumber')

global.syncAsync = {}

Given('I go on the website {string}', async (url) => {
    await browser.url(url)
})

Then('I click on link {string}', async (selector) => {
    await browser.click(selector)
})

Then('should the title of the page be {string}', async (expectedTitle) => {
    assert.equal(await browser.getTitle(), expectedTitle)
})

Given('I go on the website {string} the async way', async (url) => {
    await browser.url(url)
})

Then('I click on link {string} the async way', async (selector) => {
    await browser.click(selector)
})

Then('should the title of the page be {string} the async way', async (expectedTitle) => {
    const title = await browser.getTitle()
    assert.equal(title, expectedTitle)
})
BeforeAll(() => {
    assert.equal(true, true)
})

Before(() => {
    assert.equal(true, true)
})

Before('@test', () => {
    assert.equal(true, true)
})

After(() => {
    assert.equal(true, true)
})

AfterAll(() => {
    assert.equal(true, true)
})
