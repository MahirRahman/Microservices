const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl.js')
const app = express()

mongoose.connect('mongodb://localhost/shortUrls', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.get('/', async (req,res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index', { shortUrls: shortUrls });
})

app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create(
        {
            full: req.body.id_url
        }
    )
    res.redirect('/');
})

app.get('/:shortUrl', async (req, res) => {
    // console.log(req.params);
    // res.render('index', { shortUrls: shortUrls });
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) {
        console.log(shortUrl);
        console.log("Hello")
        console.log(req.params.shortUrl)
        return res.sendStatus(404)
    }
    else {
        shortUrl.clicks++;
        shortUrl.save();

        res.redirect(shortUrl.full);
    }
})

app.listen(process.env.PORT || 5000);

