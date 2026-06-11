// browser.js
const puppeteer = require('puppeteer')

let browserPromise

module.exports.getBrowser = async () => {
    if (!browserPromise) {
        browserPromise = puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
    }

    return browserPromise
}
