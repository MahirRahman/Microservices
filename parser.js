require('dotenv').config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const puppeteer = require('puppeteer');
const $ = require('cheerio').default;
const CronJob = require('cron');

const url = 'https://www.amazon.com/Wireless-Uiosmuph-Rechargeable-Portable-Computer/dp/B0836GXKKB/';

async function configureBrowser() {
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
    if (price == null) {
        // Do something
    }
    else {
        actualPrice = Number(price.replace(/[^0-9.-]+/g, ""));
        if (email !== "") {
            sendNotification(url, actualPrice, desiredPrice, email);
        }
    }
}

async function startTracking(url, desiredPrice, email="") {
    let page = await configureBrowser();
    // let job = new CronJob('* */15s * * * *', function() {
    //     checkPrice(page);
    // }, null, true, null, null, true);
    // job.start();
    await checkPrice(page, url, desiredPrice, email);
}

async function sendNotification(url, actualPrice, desiredPrice, email) {
    if (actualPrice > desiredPrice) {
        const msg = {
            to: email,
            from: 'amazon-price-checker@gmail.com',
            subject: 'Price Change Detected',
            text: 'Price dropped to ' + actualPrice,
            html: `<a href= \"${url}\" > Link </a>`
        }

        sgMail.send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
    else {
        const msg = {
            to: email,
            from: process.env.email,
            subject: 'Price Change Detected',
            text: 'Price dropped to ' + actualPrice,
            html: `<a href= \"${url}\" > Link </a>`
        }

        sgMail.send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error)
            })
    }
}
startTracking('https://www.amazon.com/Wireless-Uiosmuph-Rechargeable-Portable-Computer/dp/B0836GXKKB/', 100, 'rahmanm7@miamioh.edu');