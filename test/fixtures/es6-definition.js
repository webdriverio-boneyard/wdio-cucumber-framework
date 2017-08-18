import {defineSupportCode} from 'cucumber'

global.syncAsync = {}

defineSupportCode(function ({Given, When, Then}) {
    Given('I go on the website {stringInDoubleQuotes}', (url) => {
        return browser.url(url)
    })
})
