var restify = require('restify');

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

    try{
        if(req.body) properties = (JSON.parse(req.body)).payload;
        else validJson = false;
    } catch(exception){
        validJson = false;
    }

    //if the JSON file is not valid, return with 400 error
    if(!validJson){
        res.send(400, { "error" : "Could not decode request: JSON parsing failed"});
    } else {
        let results = [];
        properties.forEach((property)=> {
            //Check if required keys exist on the Property Object
            //For now, I am enforcing existence of 'type', 'workflow' and 'address' keys
            if(!property.type || !property.workflow || !property.address) {
                validJson = false;
                res.send(400, { "error" : "Could not decode request: JSON parsing failed"});
                return;
            }

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
        })
        if(validJson) res.send(200, {response: results});
    }
});

/**
 *
 */
server.get('/',(req, res)=>{
    res.sendRaw("Tough luck Charlie! You have reached the dead end. Nothing to see here! Perhaps, you could try POSTing JSON to this URL!");
});

/**
 * Application listening to port assigned by Heroku or 4000
 */
server.listen(process.env.PORT||4000, function() {
    console.log('API Webservice listening at http://localhost:',(process.env.PORT||4000));
});
