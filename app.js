/*jshint node:true*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var ibmbluemix = require('ibmbluemix');

var spreadsheet = require("google-spreadsheet");

var logger = ibmbluemix.getLogger();


// https://docs.google.com/spreadsheets/d/18k2VU7-xRTb3jljAeK6dA8VWDzfsBkZni7_Yq6DG_y0/pubhtml

var blog = new spreadsheet('18k2VU7-xRTb3jljAeK6dA8VWDzfsBkZni7_Yq6DG_y0');

blog.getRows(1, {
    start: 0, // start index 
    num: 100 // number of rows to pull 
}, function (err, row_data) {
    if (err) {
        logger.warn('Failed to retrieve spreadsheet data');
        logger.error(err);
    } else {
        logger.info('Retrieved spreadsheet data');

        for (var r in row_data) {
            console.log(row_data[r].title);
        }
    }
});







// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');


// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
    res.sendfile('index.html');
});


app.get('/blog', function (req, res, next) {


    var response = {
        'outcome': 'failure'
    };

    var data = [];

    res.setHeader('Content-Type', 'application/json');

    blog.getRows(1, {
        start: 0, // start index 
        num: 100 // number of rows to pull 
    }, function (err, row_data) {
        if (err) {
            logger.warn('Failed to retrieve spreadsheet data');
            logger.error(err);

            res.end(JSON.stringify(response));

        } else {
            logger.info('Retrieved spreadsheet data');

            for (var r in row_data) {

                var e = row_data[r];

                var entry = {
                    'id': e.id,
                    'title': e.title,
                    'content': e.content,
                    'date': e.date,
                    'author': e.author
                }

                data.push(entry);

                console.log(entry);
            }

            response = {
                'outcome': 'success',
                'data': data
            };

            res.end(JSON.stringify(response));
        }
    });
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function () {

    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});