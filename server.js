const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl.js')
const scrapper = require('./parser.js')
var bodyParser = require('body-parser')
const app = express()


mongoose.connect('mongodb://localhost/shortUrls', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req,res) => {
    res.render('home')
})
app.get('/urlshortener', async (req,res) => {
    const shortUrls = await ShortUrl.find()
    res.render('urlshortener', { shortUrls: shortUrls });
})

app.post('/urlshortener/shortUrls', async (req, res) => {
    await ShortUrl.create(
        {
            full: req.body.id_url
        }
    )
    res.redirect('/urlshortener');
})

app.get('urlshortener/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) {
        return res.sendStatus(404)
    }
    else {
        shortUrl.clicks++;
        shortUrl.save();

        res.redirect(shortUrl.full);
    }
})


app.get('/webscrapper', (req,res) => {
    
    res.render('webscrapper', {data: "None"});
})

app.post('/webscrapper/updates', async function(req,res) {
    await scrapper.startTracking(req.body.url, req.body.price, req.body.email)
    res.render('webscrapper', {data: "result"});
})
app.use((req, res) => {
    res.status(404).send("<h1>Sorry can't find that!</h1>")
})

app.listen(process.env.PORT || 5000);

