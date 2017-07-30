var restify = require('restify');
var i18n = require("i18n");
var PropertyHelper = require('./property-helper');

var server = restify.createServer();

server.use(restify.plugins.bodyParser());

i18n.configure({
    locales:['en'],
    directory: './locales'
});

/**
 * Post Method that accepts the JSON file for processing.If the JSON file is valid, then it filters the records based
 * on property.type == 'htv' && property.workflow == 'completed' and returns the filtered data.
 *
 * If the JSON file is of the invalid format, then 400 response is returned to the user.
 *
 * The expected format of the JSON file is as below:
 * {
    "payload": [
        {
            "address": {
                "buildingNumber": "28",
                "lat": -33.912542000000002,
                "lon": 151.00293199999999,
                "postcode": "2198",
                "state": "NSW",
                "street": "Donington Ave",
                "suburb": "Georges Hall"
            },
            "propertyTypeId": 3,
            "readyState": "init",
            "reference": "aqsdasd",
            "shortId": "6Laj49N3PiwZ",
            "status": 0,
            "type": "htv",
            "workflow": "pending"
        }
    ]
   }
 */
server.post('/',(req, res, next)=>{

    let payload = null;

    try {
        if(req.is('json')) payload = req.body.payload;
        if(req.is('text')) payload = (JSON.parse(req.body)).payload;
    } catch(exception){}

    if(payload) {
        PropertyHelper.filter(payload, {type: 'htv', workflow: 'completed'}, (err, data)=>{
            if(err) res.send(400, { "error" : i18n.__('ERR_DEFAULT')+" : "+ err.message});
            else res.send(200, {response: data});
        })
    }
    else { res.send(400, { "error" : i18n.__('ERR_DEFAULT')}); next(); }
});

/**
 * Application listening to port assigned by Heroku or 4000
 */
server.listen(process.env.PORT||4000, function() {
    console.log('API Webservice listening at http://localhost:', (process.env.PORT||4000));
});