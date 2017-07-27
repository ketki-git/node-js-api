var restify = require('restify');

const ERR_DEFAULT = "Could not decode request: JSON parsing failed";
const ERR_CONTENT_TYPE = "Could not decode request. Please ensure that the content-type of the POST data is 'application/json'";
const ERR_MISSING_KEYS = "Could not decode request. Please ensure that your JSON object has 'type', 'workflow' and 'address' properties.";

var server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

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
server.post('/',(req, res)=>{
    let validJson = true;
    let properties;
    let ERR_MSG = ERR_DEFAULT;

    try{
        if(req.contentType() != 'application/json') {
            validJson = false;
            ERR_MSG = ERR_CONTENT_TYPE;
        }
        else if(req.body) {
            properties = req.body.payload;
        }
        else {
            validJson = false;
        }
    } catch(exception){
        validJson = false;
    }

    if(validJson){
        let results = [];
        for(let property of properties){
            //Check if required keys exist on the Property Object
            //For now, I am enforcing existence of 'type', 'workflow' and 'address' keys
            if(!property.type || !property.workflow || !property.address) {
                validJson = false;
                res.send(400, { "error" : ERR_MISSING_KEYS});
                break;
            }
            else {
                //filter properties on type='htv' & workflow='completed' as asked in the assignment
                if(property.type == 'htv' && property.workflow == 'completed'){

                    let address = [];
                    //create an array of non-null address properties which we can concat together

                    if(property.address.unitNumber) address.push(property.address.unitNumber+', ');
                    if(property.address.buildingNumber) address.push(property.address.buildingNumber+' ');
                    if(property.address.street) address.push(property.address.street+' ');
                    if(property.address.suburb) address.push(property.address.suburb+' ');
                    if(property.address.postcode) address.push(property.address.postcode);

                    results.push({
                        concataddress: ''.concat(...address),
                        type: property.type,
                        workflow: property.workflow
                    });
                }
            }
        }
        if(validJson) res.send(200, {response: results});
    }
    //if the JSON file is not valid, return with 400 error
    else {
        res.send(400, { "error" : ERR_MSG});
    }

});

/**
 *
 */
server.get('/',(req, res)=>{
    res.sendRaw("Tough luck! You have reached the dead end. Nothing to see here! Perhaps, you could try POSTing valid JSON to this URL!");
});

/**
 * Application listening to port assigned by Heroku or 4000
 */
server.listen(process.env.PORT||4000, function() {
    console.log('API Webservice listening at http://localhost:', (process.env.PORT||4000));
});
