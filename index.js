require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// URL storage (in-memory database)
const urlDatabase = {};
let urlCount = 1;

// POST endpoint to create short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  const parsedUrl = urlparser.parse(originalUrl);
  
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    const shortUrl = urlCount;
    urlDatabase[shortUrl] = originalUrl;
    urlCount++;
    
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
