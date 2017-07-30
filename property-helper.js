var async = require('async')
var i18n = require("i18n");

class PropertyHelper{
    /**
     * A function that accepts array of properties and filters them based on given criteria and returns the array of
     * property object in following format.
     * {
     *   concataddress: concatenation_of_unitNumber_buildingNumber_street_suburb_postcode_fields,
     *   type: type,
     *   workflow: workflow_status
     * }
     * @param properties array of property objects
     * @param filterCriteria object representing filter criteria. e.g. {type: 'htv', workflow: 'completed'}
     * @param callback callback method that returns array of properties satisfying filtering criteria
     */
    static filter(properties, filterCriteria, callback){

        if(!Array.isArray(properties)){ return callback(new Error(i18n.__('ERR_MISSING_ARRAY'))) }

        let results = [];

        async.eachLimit(properties, 5, (property, propertyCb)=>{
            if(!PropertyHelper.valid(property)) {
                return propertyCb(new Error(i18n.__('ERR_REQUIRED_KEYS')))
            }

            let filterSatisfied = true;
            //if filter criteria is present, then check if our property satisfies given filter criteria
            if(filterCriteria){
                Object.keys(filterCriteria).forEach((key)=>{
                    filterSatisfied = filterSatisfied && (property[key] == filterCriteria[key]);
                })
            }

            if(filterSatisfied)  {
                let address = '';
                //now create concatenated address
                ['unitNumber', 'buildingNumber', 'street', 'suburb', 'postcode'].forEach((key)=>{
                    if(property.address[key]){ address += property.address[key]+" "; }
                })
                results.push({ concataddress: address.trim(),  type: property.type, workflow: property.workflow})
            }
            propertyCb();
        }, (err)=> callback(err, results))
    }

    /**
     * Function that checks if the 'Property' object has all the required keys. The required keys are:
     * address, propertyTypeId, readyState, reference, shortId, status, type, workflow
     *
     * @param property JSON object containing details about the property
     * @returns {boolean} true if all the required properties are present in the JSON Object. If any of the keys are
     * missing, then it will return false
     */
    static valid(property){
        let requiredKeys = ["address", "propertyTypeId", "readyState", "reference", "shortId", "status", "type", "workflow"];
        for(let key in requiredKeys){
            if(property[requiredKeys[key]] == undefined) return false;

        }
        return true;
    }
}

module.exports = PropertyHelper;