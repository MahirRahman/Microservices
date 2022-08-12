require('dotenv').config()
const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(***)
const puppeteer = require('puppeteer');
const $ = require('cheerio').default;

async function configureBrowser(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkPrice(page, url, desiredPrice, email="") {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    let price = "";
    // console.log(html);
    $('span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay .a-offscreen', html).each(function () {
        if (price === "") {
            price = $(this).text();
        }
    });
    console.log(price);
    if (price == null) {
        console.log("This is not an Amazon URL");
    }
    else {
        actualPrice = Number(price.replace(/[^0-9.-]+/g, ""));
        console.log(actualPrice)
        console.log(showMessage(url, actualPrice, desiredPrice, email));
    }
}

async function startTracking(url, desiredPrice, email="") {
    let page = await configureBrowser(url);
    await checkPrice(page, url, desiredPrice, email);
}

function showMessage(url, actualPrice, desiredPrice, email) {
    var data = "";
    if (actualPrice > desiredPrice) {
        data = 'Price has not fallen to desired level. It is currently: ' + actualPrice;
    }
    else {
        data = "Price has fallen below your desired price of $" + desiredPrice + ". It is now at $" + actualPrice;
    }
    return data;
}
async function sendNotification(url, actualPrice, desiredPrice, email) {
    if (actualPrice > desiredPrice) {
        const msg = {
            to: email,
            from: '*****r@gmail.com',
            subject: 'Price Has Not Fallen to desired Level',
            text: 'Price has not falled to desired level. It is currently: ' + actualPrice,
            html: `Here is a link to the product landing page: <a href= \"${url}\" > Link </a>`
        }

        sgMail.send(msg)
            .then(() => {
                console.log('Email sent 1')
            })
            .catch((error) => {
                console.error(error)
            })
    }
    else {
        const msg = {
            to: email,
            from: process.env.email,
            subject: 'Price Has Fallen Below Desired Prices!!!',
            text: 'Congratulations! The wait is over. Your desired product\'s price has dropped to ' + actualPrice,
            html: `Here is a link to your product's landing page <a href= \"${url}\" > Link </a>`
        }

        sgMail.send(msg)
            .then(() => {
                console.log('Email sent 2')
            })
            .catch((error) => {
                console.error(error)
            })
    }
}
// startTracking('https://www.amazon.com/Manhattan-104-key-Keyboard-Built-Indicator/dp/B07RQVB3HQ/', 1, 'rahmanm7@miamioh.edu');
module.exports = { startTracking }