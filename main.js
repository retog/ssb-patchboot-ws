const express = require('express');
const { EntryPage } = require('./lib/EntryPage.js')
console.log('entry', EntryPage )

var app = express();

app.use(express.static('public'))

// on the request to root (localhost:3000/)
app.get('/', EntryPage);

// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
    res.status(404).send("Nothing here.");
});

// start the server in the port 3000 !
app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});


