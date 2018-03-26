import { Given } from 'cucumber'

global.syncAsync = {}

Given('I go on the website {string}', (url) => {
    return browser.url(url)
})
