var express = require('express');

var app = express();

app.use(express.static('./Client/'));

app.listen(8080, function() {
    console.log('Server running');
});